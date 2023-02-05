/**
 * Store the current active call
 * as a global variable.
 */
var currentCall;
let userId;
let callStatus = false;
const appId = "C27742EC-4B08-4C34-B25A-8E7B23681DF3";
const accessToken = "3d1b39b4e237f92969ca964cec36c08562b5f077";

const SBId = Math.random().toString(36).substring(2, 12);
console.log("random UserId:", SBId);

/**
 * Connect to Sendbird Calls
 */
function connect() {
  // 유저는 나중에 DB에서 불러오기
  userId = document.getElementById("USER_ID").value;
  console.log("get userId:", userId);

  // Init Sendbird Calls with your application Id
  // SendBirdCall.init(document.getElementById("APP_ID").value);
  SendBirdCall.init(appId);

  // SB에서 사용할 랜덤 ID
  // Ask for video and audio permission
  askBrowserPermission();
  // Authorize user
  authorizeUser();
}

/**
 * When this is called, Browser will ask for Audio and Video permission
 */
function askBrowserPermission() {
  SendBirdCall.useMedia({ audio: true, video: false });

  console.log("브라우저 미디어 가져오기 완료.");
}

/**
 * To be able to make and receive calls, a user must be authorized
 */
function authorizeUser() {
  const authOption = {
    userId,
    accessToken,
  };
  SendBirdCall.authenticate(authOption, (res, error) => {
    if (error) {
      // console.dir(error);
      console.log("인증 에러 :", error);
      alert(`Error authenticating user! Is your Access 
             / Session token correct? This user exists?`);
    } else {
      console.log("SB 연결완료.");
      connectToWebsocket();
    }
  });
}

/**
 * To be able to make and receive calls,
 * a user must be connected to Sendbird
 * websockets.
 */
function connectToWebsocket() {
  SendBirdCall.connectWebSocket()
    .then(() => {
      waitForCalls();
    })
    .catch((err) => {
      console.log("웹 소켓 연결 에러 : ", err);
      alert("Failed to connect to Socket server");
    });
}

/**
 * Once connected to websockets,
 * let's wait for calls
 */
function waitForCalls() {
  console.log("전화대기, ", "SBId:", SBId);
  SendBirdCall.addListener(SBId, {
    onRinging: (call) => {
      console.log("전화온 콜:", call, "SBId:", SBId);
      if (!callStatus) {
        console.log("수신대기중", call);
        call.end();
      }
      if (callStatus) console.log("수신함", call);
      // console.log("call 정보:", call);
      console.log("수신 성공", 2);
      // const currentAudioInput = SendBirdCall.getCurrentAudioInputDevice();
      // console.log("currentAudioInput:", currentAudioInput);
      /**
       * A call arrived
       */
      // 통화 성사
      call.onEstablished = (call) => {
        console.log("수신자 통화 성사", 6);
        currentCall = call;
      };

      call.onConnected = (call) => {
        console.log("수신자 전화 연결.");
        currentCall = call;
      };

      call.onEnded = (call) => {
        console.log("수신자 전화 종료.");
        currentCall = call;
      };
      /**
       * Let's accept this call
       */
      console.log("받으면 여기가 먼저?", 3);
      const acceptParams = {
        callOption: {
          localMediaView: document.getElementById("local_video_element_id"),
          remoteMediaView: document.getElementById("remote_video_element_id"),
          audioEnabled: true,
          videoEnabled: false,
        },
      };
      call.accept(acceptParams);
      console.log("받으면 여기가 먼저?", 4);
    },
    // 현재 연결된 device, 연결 가능한 device에서 선택해서 변경
    onAudioInputDeviceChanged: async (current, availables) => {
      // const list = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      // console.log("그냥 받은 전체 디바이스 리스트:", list);
      // const getList = SendBirdCall.getAvailableAudioInputDevices();
      // console.log("받아온 사용가능한 목록:", getList);
      // console.log("사용 가능한 마이크 목록:", availables);
      // console.log("현재 사용중인 마이크:", current.label);
      const wannaUseMicInfo = availables.find((available) => available.label === "Headset earpiece");
      // const wannaUseMicInfo = availables.find(
      //   (available) => available.label === "커뮤니케이션 - Microphone(Mic-Web Camera) (1d6c:1278)"
      // );

      // console.log("사용 원하는 마이크 정보:", wannaUseMicInfo);
      if (wannaUseMicInfo) SendBirdCall.selectAudioInputDevice(wannaUseMicInfo);
      // console.log("변경되서 사용중인 마이크:", SendBirdCall.getCurrentAudioInputDevice());
    },
  });

  // console.log("listener: ", listener);
}

/**
 * Make a call to other user
 */
function makeCall() {
  /**
   * Ask user_id to call to
   */
  // 전화걸 상대 userId : 상대방 Id받아오기
  // const userId = prompt("ENTER USER ID TO CALL");
  const receiverId = prompt("ENTER USER ID TO CALL");
  // const userId = prompt(document.getElementById("TO_USER_ID").value);
  if (!receiverId) {
    return;
  }
  /**
   * Set dialing parameters
   */
  const dialParams = {
    userId: receiverId,
    isVideoCall: false,
    callOption: {
      localMediaView: document.getElementById("local_video_element_id"),
      remoteMediaView: document.getElementById("remote_video_element_id"),
      audioEnabled: true,
      videoEnabled: false,
    },
  };
  /**
   * Make the call
   */
  const call = SendBirdCall.dial(dialParams, (call, error) => {
    if (error) {
      console.log("Dial 실패!!", error);
      alert("Dial Failed!");
    } else {
      console.log("Dial 성공!", 1);
    }
  });

  console.log("dial call info:", call);
  /**
   * Once the call is established,
   * run this logic
   */
  // 상대방과 통화가 연결되면
  call.onEstablished = (call) => {
    // console.log("onEstablished");
    console.log("발신자 통화 성사", 5);
    currentCall = call;
    // Hide / Show some buttons
    document.getElementById("butMakeCall").style.display = "none";
    document.getElementById("butEndCall").style.display = "inline-block";
  };
  /**
   * Once the call is connected,
   * run this logic
   */
  call.onConnected = (call) => {
    console.log("발신자 전화연결");
  };
  /**
   * Once the call ended,
   * run this logic
   */
  call.onEnded = (call) => {
    console.log("발신자 전화 종료", call);
    currentCall = null;
    // Hide / Show some buttons
    document.getElementById("butMakeCall").style.display = "inline-block";
    document.getElementById("butEndCall").style.display = "none";
  };
  // /**
  //  * Remote user changed audio settings
  //  * (analysys not covered in this tutorial)
  //  */
  // call.onRemoteAudioSettingsChanged = (call) => {
  //   console.log("Remote user changed audio settings");
  // };
  // /**
  //  * Remote user changed audio settings
  //  * (analysys not covered in this tutorial)
  //  */
  // call.onRemoteVideoSettingsChanged = (call) => {
  //   console.log("Remote user changed video settings");
  // };
}

function endCall() {
  if (!currentCall) {
    return;
  }
  currentCall.end();
}
