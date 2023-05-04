const GetEmptyRoom = require("./123").GetEmptyRoom;

const rooms = new Map();

const connect = (token, name, callback) => {
  if (rooms.has(name)) return;
  const room = GetEmptyRoom();
  rooms.set(name, room);
  return room.connect(token, function () {
    callback({ ...arguments[0], name });
  });
  
};
const disconnect = (name) => {
  if (rooms.has(name)) {
    rooms.get(name).disconnect();
    rooms.delete(name);
  }
};

const sendMessage = (data) => {
  if (rooms.has("main")) {
    rooms.get("main").sendMessage(data)
  }
}

const sendGenericMessage = (data) => {
  if (rooms.has("main")) {
    rooms.get("main").sendGenericMessage(data)
  }
}

exports.sendMessage = sendMessage;
exports.sendGenericMessage = sendGenericMessage;
exports.disconnect = disconnect;
exports.connect = connect;