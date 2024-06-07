const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();

// Настройка парсера тела запроса и сессий
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Путь к файлу user.json
const dataPath = path.join(__dirname, 'data', 'user.json');

// Функция для чтения файла user.json
function readUserData(callback) {
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }
    try {
      const jsonData = JSON.parse(data || '[]');
      callback(null, jsonData);
    } catch (err) {
      callback(err);
    }
  });
}

// Функция для записи в файл user.json
function writeUserData(jsonData, callback) {
  fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), 'utf8', callback);
}

// Обработка регистрации
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  // Чтение существующих данных
  readUserData((err, users) => {
    if (err) return res.status(500).send('Ошибка при чтении файла.');

    // Проверка на уникальность пользователя
    if (users.find(user => user.username === username || user.email === email)) {
      return res.status(400).send('Пользователь уже существует.');
    }

    // Добавление нового пользователя
    users.push({
      id: users.length + 1,
      username,
      email,
      password: hashedPassword
    });

    // Запись обновленных данных
    writeUserData(users, (err) => {
      if (err) return res.status(500).send('Ошибка при записи файла.');
      res.status(200).send('Пользователь зарегистрирован.');
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
