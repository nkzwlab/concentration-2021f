import { Server, Socket } from "socket.io";
import { shuffle } from "lodash";
import * as express from "express";

var app = express();
var http = require('http').Server(app);

app.use(express.static('../front/dist'));

let io = require("socket.io")(http,{
  cors:{
    origin: "http://localhost:8080",
        methods: ["GET", "POST"],
  }
});



http.listen(3000, function(){
  console.log('server listening. Port:3000');
});

let turn = -1;

let cards: string[] = [];

//@ts-ignore
io.on("connection", (socket: ExtendedSocket) => {
  socket.username = "";
  socket.on("name", async (name: string) => {
    socket.username = name;
    const sockets = await io.fetchSockets();
    io.emit(
      "namelist",
      //@ts-ignore
      sockets.map((socket) => socket.username)
    );
  });
  socket.on("start", () => {
    turn = -1
    socket.broadcast.emit("start");
    cards = shuffle([...CARD_LIST]);
    io.fetchSockets().then((sockets) => {
      sockets.forEach((socket) => {
        // @ts-ignore
        socket.score = 0;
      });
    });
    nextTurn();
  });
  socket.on("mkr", (index: number) => {
    io.emit("mkr", index, cards[index]);
  });
  socket.on("nextTurn", (index: number) => {
    nextTurn();
  });
  socket.on("success", (index: number) => {
    socket.score++;
    calcFinish();
    io.fetchSockets().then((sockets) => {
      io.emit(
        "namelist",
        sockets.map((socket) =>
          socket.id === sockets[turn].id
            ? //@ts-ignore
              `${socket.username} 点数:${socket.score}←`
            : //@ts-ignore
              `${socket.username} 点数:${socket.score}`
        )
      );
    });
  });
});

function calcFinish(): void {
  io.fetchSockets().then((sockets) => {
    //@ts-ignore
    if (sockets.reduce((a, b) => a.score + b.score) === 26) {
      io.emit(
        "namelist",
        sockets.map((socket) =>
          socket.id === sockets[turn].id
            ? //@ts-ignore
              `${socket.username} 点数:${socket.score}`
            : //@ts-ignore
              `${socket.username} 点数:${socket.score}`
        )
      );
      io.emit("finish");
    }
  });
}

function nextTurn(): void {
  io.fetchSockets().then((sockets) => {
    turn++;
    if (turn > sockets.length - 1) {
      turn = 0;
    }
    sockets[turn].emit("yourturn");
    io.emit(
      "namelist",
      sockets.map((socket) =>
        socket.id === sockets[turn].id
          ? //@ts-ignore
            `${socket.username} 点数:${socket.score}←`
          : //@ts-ignore
            `${socket.username} 点数:${socket.score}`
      )
    );
  });
}

interface ExtendedSocket extends Socket {
  username: string;
  score: number;
}

const CARD_LIST = [
  "♣️A",
  "♣️2",
  "♣️3",
  "♣️4",
  "♣️5",
  "♣️6",
  "♣️7",
  "♣️8",
  "♣️9",
  "♣️➓",
  "♣️J",
  "♣️Q",
  "♣️K",
  "♦️A",
  "♦️2",
  "♦️3",
  "♦️4",
  "♦️5",
  "♦️6",
  "♦️7",
  "♦️8",
  "♦️9",
  "♦️➓",
  "♦️J",
  "♦️Q",
  "♦️K",
  "❤️A",
  "❤️2",
  "❤️3",
  "❤️4",
  "❤️5",
  "❤️6",
  "❤️7",
  "❤️8",
  "❤️9",
  "❤️➓",
  "❤️J",
  "❤️Q",
  "❤️K",
  "♠️A",
  "♠️2",
  "♠️3",
  "♠️4",
  "♠️5",
  "♠️6",
  "♠️7",
  "♠️8",
  "♠️9",
  "♠️➓",
  "♠️J",
  "♠️Q",
  "♠️K",
  "😈😈",
];
