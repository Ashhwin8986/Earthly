import express from "express";
import { getWeatherForecast, getAirQualityData } from "../services/weatherService.js";

const router = express.Router();

router.get("/forecast", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

    const data = await getWeatherForecast(Number(lat), Number(lon));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "weather fetch failed" });
  }
});

router.get("/air", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

    const data = await getAirQualityData(Number(lat), Number(lon));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "air fetch failed" });
  }
});

export default router;
