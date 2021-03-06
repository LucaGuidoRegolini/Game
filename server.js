import express from "express";
import http from "http";
import { Server as socketio } from "socket.io";

import createGame from "./public/game.js";

const app = express();
const server = http.createServer(app);
const sockets = new socketio(server);

app.use(express.static("public"));

const game = createGame();
game.start();

game.subscribe((command) => {
  sockets.emit(command.type, command);
});

sockets.on("connection", (socket) => {
  const playerId = socket.id;
  console.log(`> Player connected on Server with id: ${playerId}`);

  game.addPlayer({ playerId: playerId });

  socket.emit("setup", game.state);

  socket.on("disconnect", () => {
    game.removePlayer({ playerId: playerId });
    console.log(`> Player disconnect: ${playerId}`);
  });

  socket.on("move-player", (command) => {
    command.playerId = playerId;
    command.type = "move-player";

    game.movePlayer(command);
  });

  socket.on("add-score", (command) => {
    game.addScore(command);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`>Server listening on port: ${port}`);
});
