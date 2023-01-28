import socketIO from "socket.io";
import express from "express";
import genRandomString from "./libs/genRandomString";

const app = express();

const PORT = 12000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

/** 접속 resolver
 * QR 시리얼 입력값 통해 전화 받을 사용자의 Id를 지정
 * 시리얼이 있으면 발신자는 socket.id사용
 */

// const serial = "112233";
// const receiverId = "sesia";
// const senderId = "";

// roomName random생성
const roomName = genRandomString();

const server = app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});

const io = socketIO(server, { path: "/socket.io" });

io.on("connection", (socket) => {
  // 시리얼이 있으면 발신자. 발신자는 socket.id 사용
  // const userId = serial ? socket.id : receiverId;
  const userId = socket.id;
  console.log(userId);

  socket.emit("getRoomName", (roomName) => {
    console.log(roomName);
  });

  const joinRoom = socket.on("join_room", (roomName) => {
    console.log("룸에입장하였습니다.");
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  console.log(joinRoom);

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });

  socket.on("sendCall", (roomName) => {
    socket.to(roomName).emit("receiveCall");
  });

  socket.on("received", (roomName) => {
    socket.to(roomName).emit("received");
  });

  socket.on("end", (roomName) => {
    socket.to(roomName).emit("close");
    socket.in(roomName).disconnectSockets(true);
  });

  // //* 연결 종료 시
  // socket.on("disconnect", () => {
  //   console.log("클라이언트 접속 해제", ip, socket.id);
  //   clearInterval(socket.interval);
  // });

  // //* 클라이언트로 메세지 보내기
  // socket.interval = setInterval(() => {
  //   // 3초마다 클라이언트로 메시지 전송
  //   socket.emit("news", "Hello Socket.IO");
  // }, 3000);
});

/**
 *  socket.request => 요청 객체에 접근
 *  socket.request.res => 응답객체에 접근
 */
