const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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

// Функция для регистрации пользователя
function registerUser({ username, email, password }, callback) {
  readUserData((err, users) => {
    if (err) return callback(err);

    // Проверка на уникальность пользователя
    if (users.some(user => user.username === username || user.email === email)) {
      return callback(new Error('Пользователь уже существует.'));
    }

    // Хеширование пароля
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Добавление нового пользователя
    users.push({ id: users.length + 1, username, email, password: hashedPassword });

    // Запись обновленных данных
    writeUserData(users, callback);
  });
}

module.exports = { registerUser };
