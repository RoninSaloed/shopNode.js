import express from "express";
import {
  addThings,
  getAllThings,
  getThingById,
  purchaseThing,
  removeThingById,
  getPaginatedThings,
  getSearchThings,
} from "../controllers/thingsController";
import { validateToken } from "../middleware/validateToken";

const router = express.Router();

router.post("/addThings", addThings);
router.post("/purchase", purchaseThing);

router.get("/getAllThings", getAllThings);
router.get("/getPaginatedThings", getPaginatedThings);
router.get("/getSearchThings", getSearchThings);

router.get("/getThingById", getThingById);
router.delete("/removeThingById", removeThingById);

router.use(validateToken);
export { router as thingRoutes };
