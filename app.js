import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import donationRoutes from "./routes/donations.js";


const app = express();
app.use(cors());
app.use(express.json());

// 3. Mount routes
app.use("/api/donations", donationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
