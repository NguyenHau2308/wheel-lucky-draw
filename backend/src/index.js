import express from "express";
import cors from "cors";
import participants from "./routes/participants.js";
import draw from "./routes/draw.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/participants", participants);
app.use("/draw-result", draw);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
