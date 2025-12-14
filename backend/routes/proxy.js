const express = require("express");
const http = require("http");
const https = require("https");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const raw = (req.query.url || "").toString();
    if (!raw) return res.status(400).send("Missing url");
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return res.status(400).send("Invalid protocol");
    }
    const client = u.protocol === "http:" ? http : https;
    const reqOpts = {
      hostname: u.hostname,
      path: u.pathname + (u.search || ""),
      headers: { Referer: undefined },
    };
    client
      .get(reqOpts, (r) => {
        res.status(r.statusCode || 200);
        const ct = r.headers["content-type"] || "application/octet-stream";
        res.setHeader("Content-Type", ct);
        res.setHeader("Cache-Control", "public, max-age=3600");
        r.pipe(res);
      })
      .on("error", (err) => {
        res.status(500).send("Proxy error");
      });
  } catch (err) {
    res.status(400).send("Bad url");
  }
});

module.exports = router;
