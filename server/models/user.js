const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String
  },
  profile_picture: {
    type: String
  },
  initials: {
    type: String
  },
  connections: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  mobileNo: {
    type: String,
    default: "+91 9979459887"
  }
});

module.exports = model('User', userSchema)