const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const User = require("./models/user");

const app = express();
const server = http.createServer(app);
const indexRouter = require("./routes/route");

// to allow multiple origins for cors policy
var whitelist = ["http://localhost:5173", "http://127.0.0.1:5173"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "PUT", "POST"],
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

mongoose.connect("mongodb://localhost:27017/MEVN_Chat_App", {
  useNewUrlParser: true,
});
mongoose.set("strictQuery", false);
const db = mongoose.connection;
db.on("error", (err) =>
  console.log("Error connecting Database (┬┬﹏┬┬)\n", err)
);
db.once("open", () => {
  console.log("Connected to Database (〃￣︶￣)人(￣︶￣〃)");

  User.countDocuments({}, (err, c) => {
    if (c == 0) {
      let newUsers = [
        {
          username: "parth",
          name: "Parth Shiroya",
          password: "1234",
          bio: "I am Parth and I know it.",
          initials: "PS"
        },
        {
          username: "pop",
          name: "Popat Pankhi",
          password: "1234",
          bio: "You are a fool man.",
          initials: "PP"
        },
        {
          username: "kallu",
          name: "Kallu Kalia",
          password: "1234",
          initials: "KK"
        },
      ];

      User.insertMany(newUsers, (err, docs) => {
        if (err) {
          return console.error(err);
        } else {
          console.log("Users created :-)");
        }
      });
    }
  });
});

io.on("connection", (socket) => {
  console.log("a user connected");

  // emit event to all sockets but new one

  socket.on("new-user", () => {
    socket.broadcast.emit("new-user-ping");
  });

  socket.on("data-changes", () => {
    socket.broadcast.emit("data-changes-ping");
  });
});

app.use("/", indexRouter);

server.listen(3000, () => {
  console.log("Server running on 3000");
});
