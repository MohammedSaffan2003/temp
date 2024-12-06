import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  lastMessage: { type: Date, default: Date.now }
}, {
  timestamps: true
});

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessage: -1 });

export default mongoose.model('Chat', chatSchema);