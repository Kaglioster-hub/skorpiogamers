import fs from "fs";

export default function handler(req, res) {
  try {
    const q = (req.query.q || "").toLowerCase();
    if (!q) return res.status(400).json({ error: "Missing query" });

    const deals = JSON.parse(fs.readFileSync("site/deals.json", "utf8"));
    const results = deals.filter(x =>
      x.title.toLowerCase().includes(q)
    ).slice(0, 10);

    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ error: "Internal error" });
  }
}
