const Quote = require("../models/Quote");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllQuotes = async (req, res) => {
  console.log(req.user);
  const quotes = await Quote.find({ createdBy: req.user.userId }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ quotes, count: quotes.length });
};

const getQuote = async (req, res) => {
  const {
    user: { userId },
    params: { id: quoteId },
  } = req;

  const quote = await Quote.findOne({
    _id: quoteId,
    createdBy: userId,
  });

  if (!quote) {
    throw new NotFoundError(`No quote with id ${quoteId}`);
  }

  res.status(StatusCodes.OK).json({ quote });
};

const createQuote = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const quote = await Quote.create(req.body);
  res.status(StatusCodes.CREATED).json({ quote });
};

const updateQuote = async (req, res) => {
  const {
    body: { quoteText },
    user: { userId },
    params: { id: quoteId },
  } = req;

  if (quoteText === "") {
    throw new BadRequestError("Must enter a quote");
  }

  const quote = await Quote.findByIdAndUpdate(
    {
      _id: quoteId,
      createdBy: userId,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!quote) {
    throw new NotFoundError(`No quote with id ${quoteId}`);
  }
  res.status(StatusCodes.OK).json({ quote });
};

const deleteQuote = async (req, res) => {
  const {
    body: { quoteText },
    user: { userId },
    params: { id: quoteId },
  } = req;

  const quote = await Quote.findOneAndRemove({
    _id: quoteId,
    createdBy: userId,
  });

  if (!quote) {
    throw new NotFoundError(`No quote with id ${quoteId}`);
  }
  res.status(StatusCodes.OK).json({ msg: "The entry was deleted." });
};

module.exports = {
  getAllQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
};
