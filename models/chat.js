const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  messages: [
    {
      _id: {
        type: String,
        required: true,
      },
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Conversation = module.exports = mongoose.model('conversations', conversationSchema);