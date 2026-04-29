import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import geocodeRouter from "./routes/geocodeRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import nearbyRoutes from "./routes/nearbyRoutes.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/geocode", geocodeRouter);
app.use("/api/weather", weatherRoutes);
app.use("/api/nearby", nearbyRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🎉");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is vibing on port ${PORT}`);
});