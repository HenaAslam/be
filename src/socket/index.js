let onlineUsers = [];

export const newConnectionHandler = (socket) => {
  console.log("A new client connected! Id:", socket.id);

  socket.emit("welcome", { message: `HELLO ${socket.id}` });

  socket.on("disconnect", () => {
    console.log("A client disconnected. Id:", socket.id);
  });
};
