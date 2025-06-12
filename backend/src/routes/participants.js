import { Router } from "express";
import { codes } from "../data.js";
const router = Router();

router.get("/", (_, res) => {
  res.json(codes);
});

export default router;
