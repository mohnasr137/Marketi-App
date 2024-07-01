const TopSearch = require("../models/topSearch");

let searchNumber = 0;

const topSearch = async (req, res, next) => {
  try {
    const { search } = req.body;
    if (search) {
      searchNumber++;
    }
    if (searchNumber == 100) {
      const topSearch = await TopSearch.find().sort({ number: 1 }).exec();
      for(let i = 0;i<(topSearch.length-100);i++){
        await TopSearch.findByIdAndDelete(topSearch[i]._id);
      }
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = topSearch;
