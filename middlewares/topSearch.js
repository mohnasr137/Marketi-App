const TopSearch = require("../models/topSearch");

let searchNumber = 0;

const topSearch = async (req, res, next) => {
  try {
    const search = req.query?.search || req.body?.search;
    if (search && typeof search === "string" && search.trim()) {
      searchNumber++;
    }

    // Periodically prune excess search history to keep top searches performant
    if (searchNumber >= 100) {
      searchNumber = 0;
      const allSearches = await TopSearch.find().sort({ number: 1 }).exec();
      if (allSearches.length > 100) {
        const excessCount = allSearches.length - 100;
        const idsToDelete = allSearches.slice(0, excessCount).map((s) => s._id);
        await TopSearch.deleteMany({ _id: { $in: idsToDelete } });
      }
    }
    return next();
  } catch (error) {
    console.error("TopSearch middleware error:", error);
    return next(); // Don't block requests if tracking fails
  }
};

module.exports = topSearch;
