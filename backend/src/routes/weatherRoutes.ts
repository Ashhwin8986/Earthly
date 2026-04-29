import express from "express";
import { getWeatherForecast, getAirQualityData, getHeatMapData, getPollutionMapData } from "../services/weatherService.js";

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

router.get("/heatmap", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

    const data = await getHeatMapData(Number(lat), Number(lon));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "heat map fetch failed" });
  }
});

router.get("/pollution", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

    const data = await getPollutionMapData(Number(lat), Number(lon));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "pollution map fetch failed" });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

    const nearbyService = await import("../services/nearbyService.js");
    const data = await nearbyService.getNearbyLocations(Number(lat), Number(lon));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "nearby fetch failed" });
  }
});

export default router;
