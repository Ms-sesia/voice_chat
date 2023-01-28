// const socket = io();
let socket = io.connect("https://testvoicesev.platcube.com/", { path: "/socket.io" });

const myFace = document.getElementById("myFace");
const peerFace = document.getElementById("peerFace");
const sendCall = document.getElementById("sendCall");
const callBtn = document.getElementById("sendBtn");
const endBtn = document.getElementById("callEnd");
const receiveBtn = document.getElementById("receiveBtn");
const h3 = document.querySelector("h3");
const h1 = document.querySelector("h1");

endBtn.style.display = "none";
receiveBtn.style.display = "none";

let myStream;
let muted = false;
let cameraOff = false;
let roomName = "abc";
let myPeerConnection;

callBtn.addEventListener("click", handleCallSend);
endBtn.addEventListener("click", handleCallEnd);
receiveBtn.addEventListener("click", handleCallReceive);

initCall();

const initCall = async () => {
  await getMedia(); //카메라, 마이크 불러옴
  makeConnection();
  console.log("socket정보:", socket);
  console.log("연결됨");
};

const getMedia = async (deviceId) => {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (e) {
    console.log(e);
  }
};

const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });

  myPeerConnection.addEventListener("icecandidate", handleIce);

  socket.emit("join_room", roomName);

  myPeerConnection.addEventListener("addstream", handleAddStream);
  myPeerConnection.addEventListener("track", handleTrack);

  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
};

// 전화 수신
const handleCallSend = async () => {
  callBtn.style.display = "none";
  endBtn.style.display = "flex";

  h3.innerText = "전화 수신 중";
  h1.innerText = "";

  socket.emit("sendCall", roomName);
};

// 수신 종료
const handleCallEnd = async () => {
  endBtn.style.display = "none";
  callBtn.style.display = "flex";

  socket.emit("end", roomName);
};

// 전화 받기
const handleCallReceive = async () => {
  receiveBtn.style.display = "none";
  endBtn.style.display = "flex";

  socket.emit("received", roomName);
  peerFace.play();
};

const handleIce = (data) => {
  socket.emit("ice", data.candidate, roomName);
};

const handleTrack = (data) => {
  const peerFace = document.querySelector("#peerFace");
  peerFace.srcObject = data.streams[0];
  peerFace.pause();
};

const handleAddStream = (data) => {
  peerFace.srcObject = data.stream;
  peerFace.pause();
};

// socket code

// 연결
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("send offer");
  socket.emit("offer", offer, roomName);
});

// 연결
socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

// 연결
socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

// 연결
socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

// 전화가 왔을 때
socket.on("receiveCall", () => {
  h3.innerText = "BMW X5 차주";
  h1.innerText = "";

  receiveBtn.style.display = "flex";
  callBtn.style.display = "none";
});

// 내가 건 전화에 상대방이 받았을 때
socket.on("received", () => {
  peerFace.play();
});

// 전화 끊기
socket.on("close", () => {
  myPeerConnection.close();
  endBtn.style.display = "none";
  callBtn.style.display = "flex";
});
