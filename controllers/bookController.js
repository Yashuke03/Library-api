const {
  createBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById
} = require('../models/bookModel');

const addBook = async (req, res, next) => {
  try {
    const { title, author, genre, year } = req.body;

    if (!title || !author || !genre || !year) {
      return res.status(400).json({ message: 'title, author, genre, year are required' });
    }

    const bookId = await createBook({ title, author, genre, year });
    const newBook = await getBookById(bookId);

    return res.status(201).json({
      message: 'Book added successfully',
      data: newBook
    });
  } catch (error) {
    return next(error);
  }
};

const listBooks = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const author = req.query.author || '';
    const genre = req.query.genre || '';

    const data = await getBooks({ page, limit, author, genre });

    return res.status(200).json({ message: 'Books fetched successfully', ...data });
  } catch (error) {
    return next(error);
  }
};

const getSingleBook = async (req, res, next) => {
  try {
    const book = await getBookById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json({ data: book });
  } catch (error) {
    return next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { title, author, genre, year } = req.body;
    if (!title || !author || !genre || !year) {
      return res.status(400).json({ message: 'title, author, genre, year are required' });
    }

    const affectedRows = await updateBookById(req.params.id, { title, author, genre, year });

    if (!affectedRows) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updatedBook = await getBookById(req.params.id);
    return res.status(200).json({ message: 'Book updated successfully', data: updatedBook });
  } catch (error) {
    return next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const affectedRows = await deleteBookById(req.params.id);

    if (!affectedRows) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addBook,
  listBooks,
  getSingleBook,
  updateBook,
  deleteBook
};
