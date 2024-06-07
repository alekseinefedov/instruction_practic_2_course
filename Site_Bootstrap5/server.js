const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// обработчик маршрута для корневого пути 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// папка со статическими файлами
app.use(express.static(path.join(__dirname, 'public')));

// Путь к файлу user.json
const dataPath = path.join(__dirname, 'data', 'user.json');

// Функция для чтения данных из файла
function readUserData() {
  return new Promise((resolve, reject) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data || '[]'));
    });
  });
}

// Функция для записи данных в файл
function writeUserData(users) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dataPath, JSON.stringify(users, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Маршрут для обработки регистрации
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, 'confirm-password': confirmPassword } = req.body;
    
    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      return res.status(400).send('Пароли не совпадают.');
    }

    const users = await readUserData();

    // Проверка на уникальность пользователя
    if (users.some(user => user.username === username || user.email === email)) {
      return res.status(400).send('Пользователь уже существует.');
    }

    // Хеширование пароля
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Добавление нового пользователя
    users.push({ id: users.length + 1, username, email, password: hashedPassword });

    // Сохранение обновленного списка пользователей
    await writeUserData(users);

    res.send('Пользователь успешно зарегистрирован.');
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
