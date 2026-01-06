// when sign up or login will call this file

import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js"; 
 
const router = express.Router();

router.post("/signup" , signup); 
router.post("/login", login);
router.post("/logout", logout);
router.post("/update-profile", protectRoute, updateProfile);

router.get("/check",protectRoute,checkAuth)


// Define your authentication routes here
export default router;

