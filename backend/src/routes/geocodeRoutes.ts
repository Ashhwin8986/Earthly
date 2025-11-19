// src/routes/geocodeRoutes.ts
import { Router } from "express";
import { getCoordinatesController } from "../controllers/geocodeController.js";

const router = Router();

// GET /api/geocode?location=delhi
router.get("/", getCoordinatesController);

export default router;
