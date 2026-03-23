import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
  business_type: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  priority: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  ai_output: {
    type: Object,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Proposal", proposalSchema);