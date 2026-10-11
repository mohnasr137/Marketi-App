const mongoose = require("mongoose");

const topSearchSchema = new mongoose.Schema(
  {
    data: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    number: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

topSearchSchema.index({ number: -1 });

const TopSearch = mongoose.model("TopSearch", topSearchSchema);
module.exports = TopSearch;
