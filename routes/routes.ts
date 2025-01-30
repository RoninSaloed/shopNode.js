import express from "express";
import { userRoutes } from "./userRoutes";
import { thingRoutes } from "./thingRoutes";

const apiRouter = express.Router();

apiRouter.use("/users", userRoutes);
apiRouter.use("/things", thingRoutes);

export { apiRouter };
