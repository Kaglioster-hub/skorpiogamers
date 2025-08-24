export default async function handler(req, res) {
  try {
    const { url, partner } = req.query;
    if (!url) {
      return res.status(400).json({ error: "Missing URL" });
    }

    // (Facoltativo) logga click su console o DB
    console.log("Referral click", {
      target: url,
      partner: partner || "anon",
      time: new Date().toISOString(),
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      ua: req.headers["user-agent"]
    });

    // Redirect sicuro (302 = temporary)
    return res.redirect(302, url);
  } catch (e) {
    console.error("Track error", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
