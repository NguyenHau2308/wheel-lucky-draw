import { Router } from "express";
const router = Router();

router.post("/", (req, res) => {
  const { winner, draw_time } = req.body || {};
  console.log("Winner:", winner, draw_time);
  return res.json({ ok: true });
});

export default router;
