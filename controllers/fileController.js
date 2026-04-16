const fs = require('fs');
const path = require('path');
const {
  saveFileMetadata,
  getAllFiles,
  getFileById,
  deleteFileById
} = require('../models/fileModel');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileId = await saveFileMetadata({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id
    });

    const file = await getFileById(fileId);

    return res.status(201).json({
      message: 'File uploaded successfully',
      data: file
    });
  } catch (error) {
    return next(error);
  }
};

const listFiles = async (req, res, next) => {
  try {
    const files = await getAllFiles();
    return res.status(200).json({ message: 'Files fetched successfully', data: files });
  } catch (error) {
    return next(error);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const file = await getFileById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.stored_name);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File is missing from storage' });
    }

    return res.download(filePath, file.original_name);
  } catch (error) {
    return next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await getFileById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.stored_name);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await deleteFileById(req.params.id);

    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile
};
