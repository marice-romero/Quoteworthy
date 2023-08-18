const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema(
  {
    quoteText: {
      type: String,
      required: [true, "Please provide quote text"],
    },
    source: {
      type: String,
    },
    sourceType: {
      type: String,
      enum: {
        values: ["movie", "TV show", "book", "video game", "other"],
        message: "{VALUE} is not supported",
      },
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quote", QuoteSchema);
