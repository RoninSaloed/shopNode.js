import express from "express";
import {
  getAllUsers,
  getUserById,
  loginUser,
  registerUser,
  getUser,
  refreshToken,
} from "../controllers/userController";
import { validateToken } from "../middleware/validateToken";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.get("/user", validateToken, getUser);

router.get("/getAllUsers", getAllUsers);
router.get("/:id", getUserById);

export { router as userRoutes };
