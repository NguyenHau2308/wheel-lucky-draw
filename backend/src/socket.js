// backend/src/socket.js   (ESM)
import { createServer } from 'http';
import { Server } from 'socket.io';

const http = createServer();
const io   = new Server(http, { cors:{origin:'*'} });

io.on('connection', sock => {
  sock.on('start-spin', () => io.emit('start-spin'));
  sock.on('spin-done',  w  => io.emit('spin-done', w));
});

http.listen(5000, () => console.log('⚡ WS on :5000'));
