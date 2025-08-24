import fs from "fs";

export default function handler(req, res) {
  try {
    const url = String(req.query.url || "").trim();
    if (!url) return res.redirect(302, "/");

    // Leggi o inizializza file click
    let clicks = {};
    try {
      clicks = JSON.parse(fs.readFileSync("site/clicks.json", "utf8"));
    } catch (e) {
      clicks = {};
    }

    clicks[url] = (clicks[url] || 0) + 1;
    fs.writeFileSync("site/clicks.json", JSON.stringify(clicks, null, 2));

    return res.redirect(302, url);
  } catch (e) {
    return res.redirect(302, "/");
  }
}
