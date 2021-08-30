const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cors = require("cors");

app.use(cors());

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./chat/users");

io.on("connection", (socket) => {
  console.log("User Online");

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("canvas-data", data);
  });

  socket.on("clear", () => {
    socket.broadcast.emit("clear");
  });

  socket.on("join", (data, callback) => {
    socket.emit("cid", socket.id);
    const { error, user } = addUser({
      id: socket.id,
      data: data,
    });
    if (error) return callback(error);
    socket.join(user.roomID);

    socket.broadcast.to(user.roomID).emit("message", {
      user: {},
      text: `${user.guestName} has joined!`,
      type: "admin",
    });

    io.to(user.roomID).emit("roomData", {
      room: user.roomID,
      users: getUsersInRoom(user.roomID),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.roomID).emit("message", { user, text: message, type: "genz" });

    callback();
  });

  socket.on("language-change", (props) => {
    const roomId = props.roomId;
    io.to(roomId).emit("emit-lang-change", props.lang);
  });

  socket.on("input", (props) => {
    const roomId = props.roomId;
    io.to(roomId).emit("emit-input", props.inp);
  });

  socket.on("output", (props) => {
    const roomId = props.roomId;
    io.to(roomId).emit("emit-output", {
      out: props.out,
      err: props.err,
      errorMessage: props.errMes,
    });
  });

  socket.on("disconnect", () => {
    const { roomId, userInf } = removeUser(socket.id);

    if (userInf) {
      io.to(roomId).emit("message", {
        user: {},
        text: `${userInf.guestName} has left.`,
        type: "admin",
      });
      io.to(roomId).emit("roomData", {
        room: roomId,
        users: getUsersInRoom(roomId),
      });
    }
  });
});

const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log("server started on ", port);
});
