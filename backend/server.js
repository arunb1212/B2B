import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import apiRouter from "./routers/api.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(express.json());
db();

app.use("/api", apiRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});