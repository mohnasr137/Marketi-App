const mongoose = require("mongoose");

const topSearchSchema = mongoose.Schema({
  data: {
    require: true,
    type: String,
    trim: true,
  },
  number: {
    type: Number,
    default: 1,
  },
});

const TopSearch = mongoose.model("TopSearch", topSearchSchema);
module.exports = TopSearch;
