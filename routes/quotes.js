const express = require("express");
const router = express.Router();

const {
  getAllQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
} = require("../controllers/quotes");

router.route("/").post(createQuote).get(getAllQuotes);
router.route("/:id").get(getQuote).delete(deleteQuote).patch(updateQuote);

module.exports = router;
