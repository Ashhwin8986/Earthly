import express from "express";
import { getNearbyLocations } from "../services/nearbyService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

    const data = await getNearbyLocations(Number(lat), Number(lon));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "nearby fetch failed" });
  }
});

export default router;
