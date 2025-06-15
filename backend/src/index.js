import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import participants from './routes/participants.js';
import draw from './routes/draw.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/participants', participants);
app.use('/draw-result', draw);

app.listen(process.env.PORT, () =>
  console.log('API running on :' + process.env.PORT)
);
