import { Server, Socket } from "socket.io";
import { shuffle } from "lodash";

const io = new Server(3000, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
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
    socket.broadcast.emit("start");
    //cards = shuffle([...CARD_LIST]);
    cards = CARD_LIST;
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
  "CA",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "C9",
  "CT",
  "CJ",
  "CQ",
  "CK",
  "DA",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "DT",
  "DJ",
  "DQ",
  "DK",
  "HA",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "H7",
  "H8",
  "H9",
  "HT",
  "HJ",
  "HQ",
  "HK",
  "SA",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "ST",
  "SJ",
  "SQ",
  "SK",
  "JK",
];
