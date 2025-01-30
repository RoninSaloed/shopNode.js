import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { userRoutes } from "./routes/userRoutes";
import { thingRoutes } from "./routes/thingRoutes";
import { apiRouter } from "./routes/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.listen(PORT, () => {
  console.log("server work");
});

app.use("/api", apiRouter);
