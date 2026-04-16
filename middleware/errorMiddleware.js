const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.message && err.message.includes('Only JPG')) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({
    message: 'Something went wrong',
    error: err.message
  });
};

module.exports = { errorHandler };
