import boardsModel from "../api/boards/model.js";
let onlineUsers = new Map();

export const newConnectionHandler = (socket) => {
  // console.log("A new client connected! Id:", socket.id);
  // socket.on("sendUserId", (userId) => {
  //   onlineUsers.set(userId, socket);
  //   console.log(onlineUsers);
  // });
  // socket.emit("welcome", { message: `HELLO ${socket.id}` });
  // socket.on("onDrag", async ({ _id, columns }) => {
  //   const board = await boardsModel.findById(_id);
  //   if (board.members.length > 0) {
  //     board.members.forEach((member) => {
  //       const targetMember = onlineUsers.get(member._id.toString());
  //       if (targetMember) {
  //         targetMember.emit("updateDraggedColumns", { _id, columns });
  //       }
  //     });
  //   }
  // });
  // socket.on("disconnect", () => {
  //   console.log("A client disconnected. Id:", socket.id);
  //   onlineUsers.forEach((value, key, map) => {
  //     if (value.id === socket.id) {
  //       map.delete(key);
  //       return;
  //     }
  //   });
  //   console.log(onlineUsers);
  // });
};
