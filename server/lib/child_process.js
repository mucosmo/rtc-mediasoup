// 用于进程管理

global.processObj = {}

const kill = require('tree-kill');

module.exports = function (broadcasterId) {

    const { pid } = global.processObj[broadcasterId]
    if (pid) {
        kill(pid);
        delete global.processObj[broadcasterId];
        return { broadcasterId, pid }
    } else {
        return `broadcasterId: ${broadcasterId} does not exist.`
    }

}