
import express from "express";
import aiRoutes from "./aiRoutes";

const router = express.Router();

router.use("/ai", aiRoutes);

export default router;
