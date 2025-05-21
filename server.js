const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json()); // обязательно для DELETE с body!

// Создание папок для профилей и событий
const profileDir = path.join(__dirname, 'public/uploads/profile');
const eventsDir = path.join(__dirname, 'public/uploads/events');
fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(eventsDir, { recursive: true });

// Multer для профиля
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadProfile = multer({ storage: storageProfile });

// Multer для событий
const storageEvents = multer.diskStorage({
  destination: (req, file, cb) => cb(null, eventsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadEvents = multer({ storage: storageEvents });

// Для отдачи загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Эндпоинт для загрузки профиля
app.post('/api/upload/profile', uploadProfile.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/profile/${req.file.filename}` });
});

// Эндпоинт для загрузки фото событий
app.post('/api/upload/event', uploadEvents.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/events/${req.file.filename}` });
});

app.delete('/api/delete/event-image', (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'No imageUrl provided' });
  if (imageUrl.includes('..')) return res.status(400).json({ error: 'Invalid path' });

  const filePath = path.join(__dirname, 'public', imageUrl);
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT')
        return res.status(200).json({ message: 'File already deleted' });
      return res.status(500).json({ error: 'Error deleting file', details: err.message });
    }
    res.status(200).json({ message: 'File deleted' });
  });
});

app.delete('/api/delete/profile-image', (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'No imageUrl provided' });
  if (imageUrl.includes('..')) return res.status(400).json({ error: 'Invalid path' });

  const filePath = path.join(__dirname, 'public', imageUrl);
  fs.unlink(filePath, (err) => {
    if (err) {
      if (err.code === 'ENOENT')
        return res.status(200).json({ message: 'File already deleted' });
      return res.status(500).json({ error: 'Error deleting file', details: err.message });
    }
    res.status(200).json({ message: 'File deleted' });
  });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));