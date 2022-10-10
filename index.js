const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messagesRoute");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());
const PORT=process.env.PORT||9999;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((error) => {
    console.log(error);
  });

 app.use("/api/auth", authRoutes);
 app.use("/api/messages", messageRoutes);

const server=app.listen(PORT, ()=>{
    console.log("server is running")
})
const io = socket(server, {
  cors: {
    origin: "https://maneeshschatapp.netlify.app",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
