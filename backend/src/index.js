import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import participants from "./routes/participants.js";
import draw from "./routes/draw.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/participants", participants);
app.use("/draw-result", draw);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("start-draw", () => {
    // chuyển tiếp tới mọi wheel đã mở
    io.emit("draw-now");
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log("API+Socket on :" + PORT));
