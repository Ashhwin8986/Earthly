import { Request, Response } from "express";
import geocodeService from "../services/geocodeService.js";

export async function getCoordinatesController(req: Request, res: Response) {
  try {
    const location = req.query.location as string;

    if (!location) {
      return res
        .status(400)
        .json({ error: "Location parameter is required" });
    }

    const coordinates = await geocodeService.getCoordinates(location);

    return res.status(200).json({
      success: true,
      count: coordinates.length,
      data: coordinates,
    });

  } catch (error: any) {
    console.error("GeocodeController Error:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch geocode details",
    });
  }
}
