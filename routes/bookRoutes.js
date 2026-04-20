const express = require('express');
const {
  addBook,
  listBooks,
  getSingleBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listBooks);
router.get('/:id', getSingleBook);
router.post('/', protect, addBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
