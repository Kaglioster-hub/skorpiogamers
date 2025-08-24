import os, requests, json, re, gzip, brotli
from datetime import datetime

# === CARTELLE BASE ===
ROOT = "SkorpioGamers"
SITE = f"{ROOT}/site"
COMP = f"{ROOT}/site_compressed"
for p in [f"{SITE}/game", f"{ROOT}/api", f"{ROOT}/assets", COMP]:
    os.makedirs(p, exist_ok=True)

# === UTILS ===
def minify(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()

def safeget(d, k, default=""):
    return d[k] if k in d and d[k] else default

# === CSS globale ===
css = minify("""
body{margin:0;font-family:sans-serif;background:#000;color:#fff;text-align:center}
h1{background:linear-gradient(90deg,#ff0080,#7928ca,#2afadf);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:1rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;padding:10px;max-width:1200px;margin:auto}
.card{background:#111;border-radius:8px;padding:10px;box-shadow:0 0 6px #222;transition:.2s}
.card:hover{transform:scale(1.03)}
.price{color:#2afadf;font-weight:bold}
a{display:inline-block;margin-top:6px;padding:6px 12px;background:#2afadf;color:#000;border-radius:4px;text-decoration:none;font-weight:bold}
a:hover{background:#1fdcdc}
footer{margin-top:20px;font-size:.8rem;opacity:.7}
img{max-width:100%;border-radius:6px}
canvas{max-width:100%;background:#111;border-radius:8px;padding:10px}
""")
open(f"{ROOT}/assets/style.css", "w", encoding="utf-8").write(css)

# === FETCHERS ===
def steam():
    try:
        r = requests.get("https://www.cheapshark.com/api/1.0/deals?pageSize=20").json()
        out=[]
        for g in r:
            out.append({
                "title": g.get("title"),
                "salePrice": g.get("salePrice", 0),
                "savings": g.get("savings", 0),
                "url": "https://store.steampowered.com/app/"+str(g.get("steamAppID","")),
                "thumb": g.get("thumb",""),
                "store": "steam"
            })
        return out
    except: return []

def epic():
    try:
        r=requests.get("https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions").json()
        out=[]
        for g in r["data"]["Catalog"]["searchStore"]["elements"]:
            if g.get("promotions"):
                out.append({
                    "title": g.get("title"),
                    "salePrice": 0,
                    "savings": 100,
                    "url": "https://store.epicgames.com/p/"+safeget(g,"productSlug","#"),
                    "thumb": g.get("keyImages",[{"url":""}])[0]["url"],
                    "store":"epic"
                })
        return out
    except: return []

def humble():
    try:
        r=requests.get("https://www.humblebundle.com/store/api/search?sort=discount").json()
        out=[]
        for g in r["results"][:10]:
            out.append({
                "title": g["human_name"],
                "salePrice": g["current_price"],
                "savings": int(g["full_price"]-g["current_price"]),
                "url": "https://www.humblebundle.com/store/"+g["human_name"].replace(" ","-"),
                "thumb": g.get("store_logo",""),
                "store": "humble"
            })
        return out
    except: return []

# === RACCOLTA ===
raw=[]
for f in [steam,epic,humble]:
    raw+=f()

games={}
for d in raw:
    slug=re.sub(r"[^a-z0-9]+","-",safeget(d,"title","").lower())
    if not slug: continue
    if slug not in games or float(d.get("salePrice",999)) < float(games[slug].get("salePrice",999)):
        games[slug]=d | {"slug":slug,"url":safeget(d,"url","#")}

deals=list(games.values())
open(f"{SITE}/deals.json","w",encoding="utf-8").write(json.dumps(deals,indent=2,ensure_ascii=False))

# === STORICO PREZZI ===
histfile=f"{SITE}/history.json"
history=json.load(open(histfile,encoding="utf-8")) if os.path.exists(histfile) else {}
for d in deals:
    slug=d["slug"]; price=float(d["salePrice"] or 0)
    hist=history.get(slug,{"min":price,"last":price})
    hist["last"]=price
    if price and (hist["min"]==0 or price<hist["min"]): hist["min"]=price
    history[slug]=hist
open(histfile,"w",encoding="utf-8").write(json.dumps(history,indent=2,ensure_ascii=False))

# === TEMPLATE ===
def page(title,desc,body,canon="/",extra_head=""):
    html=f"""
    <!DOCTYPE html><html lang='it'><head>
    <meta charset='utf-8'><title>{title}</title>
    <meta name='description' content='{desc}'>
    <link rel='stylesheet' href='/assets/style.css'>
    <link rel='canonical' href='https://sg.vrabo.it{canon}'>
    <link rel='manifest' href='/manifest.json'>
    <meta name='theme-color' content='#000000'>
    {extra_head}
    </head><body>
    <h1>{title}</h1>
    {body}
    <footer>Ultimo update {datetime.now().strftime('%Y-%m-%d %H:%M')}</footer>
    <script>if('serviceWorker' in navigator){{navigator.serviceWorker.register('/sw.js');}}</script>
    </body></html>"""
    return minify(html)

# === HOMEPAGE ===
cards="".join([
    f"<div class='card'><img src='{safeget(d,'thumb')}' alt=''><h3>{d['title']}</h3><p class='price'>{d['salePrice']}$ (-{d['savings']}%)</p><a href='/api/track?url={safeget(d,'url','#')}?partner=SKORPIO'>Compra</a></div>"
    for d in deals
])
open(f"{SITE}/index.html","w",encoding="utf-8").write(page("⚡ SkorpioGamers – Offerte Giochi","Le migliori offerte auto aggiornate",f"<div class='grid'>{cards}</div>"))

# === PAGINE GIOCO con grafico storico ===
chartjs="<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>"
for d in deals:
    slug=d["slug"]; hist=history.get(slug,{})
    extra=f"<p>Min storico: {hist.get('min','?')}$ | Ultimo: {hist.get('last','?')}$</p>"
    chart=f"""
    <canvas id='chart'></canvas>
    <script>
    new Chart(document.getElementById('chart'),{{
      type:'line',
      data:{{labels:['Min','Ultimo'],datasets:[{{label:'Prezzo',data:[{hist.get('min',0)},{hist.get('last',0)}],borderColor:'#2afadf'}}]}}
    }});
    </script>"""
    content=f"<div class='card'><img src='{safeget(d,'thumb')}'><h2>{d['title']}</h2><p>Prezzo: {d['salePrice']}$ (-{d['savings']}%)</p>{extra}{chart}<a href='/api/track?url={safeget(d,'url','#')}?partner=SKORPIO'>Compra</a></div>"
    open(f"{SITE}/game/{slug}.html","w",encoding="utf-8").write(page(d['title']+" – Offerta","Offerta aggiornata per "+d['title'],content,f"/game/{slug}.html",extra_head=chartjs))

# === NEWSLETTER ===
top10=sorted(deals,key=lambda d:float(d["savings"]),reverse=True)[:10]
rows="".join([f"<li>{d['title']} – {d['salePrice']}$ (-{d['savings']}%)</li>" for d in top10])
newsletter=f"<h1>🔥 Top 10 Offerte</h1><ul>{rows}</ul>"
open(f"{SITE}/newsletter.html","w",encoding="utf-8").write(page("Newsletter – SkorpioGamers","Top offerte giornaliere",newsletter,"/newsletter.html"))

# === SITEMAP + ROBOTS ===
urls=["","/newsletter.html"]+[f"/game/{d['slug']}.html" for d in deals]
smap="<?xml version='1.0'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>"+"".join([f"<url><loc>https://sg.vrabo.it{u}</loc></url>" for u in urls])+"</urlset>"
open(f"{SITE}/sitemap.xml","w",encoding="utf-8").write(smap)
open(f"{SITE}/robots.txt","w",encoding="utf-8").write("User-agent: *\nAllow: /\nSitemap: https://sg.vrabo.it/sitemap.xml")

# === PWA ===
manifest={ "name":"SkorpioGamers","short_name":"Skorpio","start_url":"/","display":"standalone","background_color":"#000","theme_color":"#2afadf","icons":[{"src":"/assets/logo.png","sizes":"192x192","type":"image/png"}]}
open(f"{SITE}/manifest.json","w",encoding="utf-8").write(json.dumps(manifest,separators=(',',':'),ensure_ascii=False))
sw="const C='skorpio-v1';self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/index.html','/assets/style.css','/deals.json'])))});self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))})"
open(f"{SITE}/sw.js","w",encoding="utf-8").write(sw)

# === API ===
track_js="import fs from'fs';export default function handler(req,res){try{const u=String(req.query.url||'').trim();if(!u)return res.redirect(302,'/');let c={};try{c=JSON.parse(fs.readFileSync('site/clicks.json','utf8'))}catch{};c[u]=(c[u]||0)+1;fs.writeFileSync('site/clicks.json',JSON.stringify(c));return res.redirect(302,u);}catch{return res.redirect(302,'/');}}"
search_js="import fs from'fs';export default function handler(req,res){const q=(req.query.q||'').toLowerCase();if(!q)return res.status(400).json({error:'Missing'});const d=JSON.parse(fs.readFileSync('site/deals.json','utf8'));res.status(200).json(d.filter(x=>x.title.toLowerCase().includes(q)).slice(0,10));}"
stats_js="import fs from'fs';export default function handler(req,res){try{const c=JSON.parse(fs.readFileSync('site/clicks.json','utf8'));const t=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,10);res.status(200).json(t);}catch{res.status(200).json([]);}}"
open(f"{ROOT}/api/track.js","w",encoding="utf-8").write(track_js)
open(f"{ROOT}/api/search.js","w",encoding="utf-8").write(search_js)
open(f"{ROOT}/api/stats.js","w",encoding="utf-8").write(stats_js)

# === TRENDING ===
if os.path.exists(f"{SITE}/clicks.json"):
    clicks=json.load(open(f"{SITE}/clicks.json",encoding="utf-8"))
    top=sorted(clicks.items(),key=lambda x:-x[1])[:10]
    rows="".join([f"<li>{u} – {c} click</li>" for u,c in top])
    open(f"{SITE}/trending.html","w",encoding="utf-8").write(page("Trending – SkorpioGamers","Più cliccati oggi",f"<ul>{rows}</ul>","/trending.html"))

# === COMPRESSIONE ===
for root,_,files in os.walk(SITE):
    for f in files:
        path=os.path.join(root,f)
        rel=os.path.relpath(path,SITE)
        data=open(path,"rb").read()
        gpath=os.path.join(COMP,rel+".gz"); os.makedirs(os.path.dirname(gpath),exist_ok=True)
        with gzip.open(gpath,"wb",9) as g: g.write(data)
        bpath=os.path.join(COMP,rel+".br"); os.makedirs(os.path.dirname(bpath),exist_ok=True)
        open(bpath,"wb").write(brotli.compress(data))

print(f"✅ SkorpioGamers MAXI generato in {SITE}")
