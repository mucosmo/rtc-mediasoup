const Erizo = require("./debug/erizofc/erizofc");
var newIo = require('socket.io-client');

class RoomSocket {
  constructor(options = {}) {
    this.singlePC = options.singlePC || true;
    this.room = null;
  }
  /* eslint-env browser */
  /* eslint-disable no-param-reassign, no-console */

  // 加入群组
  // eslint-disable-next-line no-unused-vars
  connect = (token, callback) => {
    this.room = Erizo.Room(newIo, undefined, undefined, { token });
    this.room.addEventListener("room-disconnected", callback);
    // this.room.addEventListener("member_join", callback);
    this.room.addEventListener("group_join", callback);
    this.room.addEventListener("group_leave", callback);
    this.room.addEventListener("member_join", callback);
    this.room.addEventListener("member_leave", callback);
    this.room.addEventListener("group_create", callback);
    this.room.addEventListener("stream-data", callback);
    this.room.addEventListener("subroom_create", callback);
    this.room.addEventListener("tools_change", callback);
    this.room.addEventListener("tools_list", callback);

    this.room.addEventListener("rtc_invite", callback);
    this.room.addEventListener("room_invite", callback);
    this.room.addEventListener("rtc_join", callback);
    this.room.addEventListener("rtc_leave", callback);
    this.room.addEventListener("wbo_join", callback);
    this.room.addEventListener("wbo_leave", callback);
    this.room.addEventListener("subroom_delete", callback);
    this.room.addEventListener("generic_message", callback)
  
    return new Promise((resolve, reject) => {
      this.room.on("connection-failed", (e) => {
        reject(e);
      });

      this.room.addEventListener("room-connected", () => {
        resolve(1);
      });
      this.room.connect({ singlePC: true });
    });
  };

  // 发送消息
  sendMessage = (data) => {
    console.warn("sendMessage :>> ", data);
    if (this.room) {
      this.room.sendToolsData(data);
    } else console.log("未找到");
  };

  // 发送消息
  sendGenericMessage = (data) => {
    // console.warn("sendNewMessage :>> ", data);
    if (this.room) {
      this.room.sendGenericMessage(data);
    } else console.log("未找到");
  };
  // 离开群组
  // eslint-disable-next-line no-unused-vars
  disconnect = () => {
    this.room.disconnect();
  };
}

function GetEmptyRoom(options) {
  return new RoomSocket(options);
}

exports.GetEmptyRoom = GetEmptyRoom;
