const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now()
  },
  sent: {
    type: Boolean,
    default: false
  },
  seen: {
    type: Boolean,
    default: false
  },
  multimedia: {
    type: Boolean,
    default: false
  }
});

module.exports = model('Message', messageSchema)