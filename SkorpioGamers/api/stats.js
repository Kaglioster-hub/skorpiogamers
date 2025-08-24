import fs from "fs";

export default function handler(req, res) {
  try {
    const clicks = JSON.parse(fs.readFileSync("site/clicks.json", "utf8"));
    const top = Object.entries(clicks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return res.status(200).json(top);
  } catch (e) {
    return res.status(200).json([]);
  }
}
