// error codes
// 1 : user not found

const { Router } = require("express");
const Message = require("../models/message");
const User = require("../models/user");
const router = Router();

// delete this route
router.route("/").get(async (req, res) => {
  try {
    let messages = await Message.find({});
    let users = await User.find({});
    res.status(200).json({ messages: messages, chats: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SECTION message route
router
  .route("/messages")
  // to send or create a message
  .post((req, res) => {
    // to send messages
    let newMessage = new Message(req.body);
    newMessage.save((err, m) => {
      if (err) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(200).json(m);
      }
    });
  })
  // to delete a message
  .delete(async (req, res) => {
    let message = await Message.findById(req.body.message_id);
    console.log(message);
    Message.deleteOne({ _id: req.body.message_id })
      .then(async () => {
        let messages = await Message.find({});
        console.log(messages);
        res.status(200).json({ messages: messages });
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  });
// !SECTION message route

// SECTION user route
router
  .route("/user/login")
  // for login
  .post(async (req, res) => {
    try {
      let user = await User.find({
        username: req.body.username,
        password: req.body.password,
      });
      if (user.length !== 0) {
        res.status(200).json(user[0]);
      } else {
        res.status(500).json({ code: 1, message: "user not found" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router
  .route("/user/signup")
  // for signup
  .post(async (req, res) => {
    try {
      User.countDocuments({ username: req.body.username }, (err, c) => {
        if (c == 0) {
          let userInfo = req.body;
          let nameParts = req.body.name.split(" ");
          userInfo.initials =
            nameParts[0][0] + nameParts[nameParts.length - 1][0];
          let newUser = new User(userInfo);
          newUser.save((err, u) => {
            if (err) {
              res.status(500).json({ message: err.message });
            } else {
              res.status(200).json(u);
            }
          });
        } else {
          res
            .status(500)
            .json({ message: "username not available", code: 123 });
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router
  .route("/user/:id")
  // to get all connections and messages related to a user
  .get(async (req, res) => {
    try {
      let user = await User.findById(req.params.id);
      let connections = await User.find({ _id: { $in: user.connections } });
      let messages = await Message.find({}).or([
        { sender: user._id },
        { receiver: user._id },
      ]);
      res.status(200).json({ connections: connections, messages: messages });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
  // to update user profile
  .put(async (req, res) => {
    // TODO update user profile
  })
  // to delete user profile and messages related to them
  .delete(async (req, res) => {
    User.deleteOne({ _id: req.params.id })
      .then(async () => {
        let users = await User.find({});
        // NOTE deletes all messages that relates to deleted user
        let messages = await Message.find({}).or([
          { sender: req.body.user_id },
          { receiver: req.body.user_id },
        ]);
        if (messages !== {}) {
          Message.deleteMany(messages)
            .then(() => {
              console.log("Messages related to deleted user have been erased.");
            })
            .catch((err) => {
              console.log(
                "Afsos! Messages related to deleted user couldn't been erased."
              );
            });
        }
        res.status(200).json({ users: users });
      })
      .catch((err) => {
        console.log("Delete Account Un...");
        res.status(500).json({ message: err.message });
      });
  });

router
  .route("/user/:id/getall")
  // to get all available users (except logged one) for 'new chat'
  .get(async (req, res) => {
    try {
      // FIXME remove the logged in user from here
      let users = await User.find({ _id: { $ne: req.params.id } });
      res.status(200).json({ chats: users });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router
  .route("/user/:id/connection")
  // to update connections of a user
  .put(async (req, res) => {
    try {
      let user = await User.findById(req.params.id);
      // TODO also remove connection when a user is deleted
      user.connections.push(req.body.connection);
      user.save(async (err, u) => {
        if (err) {
          res.status(500).json({ message: err.message });
        } else {
          let connectedUser = await User.findById(req.body.connection);
          connectedUser.connections.push(req.params.id);
          connectedUser.save(async (err, cu) => {
            let connections = await User.find({
              _id: { $in: user.connections },
            });
            res.status(200).json({ user: u, conn: connections });
          });
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;
