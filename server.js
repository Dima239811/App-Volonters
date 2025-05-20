const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

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

// Для отдачи загруженных файлов (для <img src="...">)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Эндпоинт для загрузки профиля
app.post('/api/upload/profile', uploadProfile.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/profile/${req.file.filename}` });
});

// Эндпоинт для загрузки фото событий (добавь этот!!!)
app.post('/api/upload/event', uploadEvents.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/events/${req.file.filename}` });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));