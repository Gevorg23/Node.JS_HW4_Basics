const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const usersFilePath = 'users.json';

// Обработчик для получения всех пользователей
app.get('/users', async (req, res) => {
    try {
        const users = await readUsersFromFile();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Обработчик для получения пользователя по ID
app.get('/users/:id', async (req, res) => {
    try {
        const users = await readUsersFromFile();
        const user = users.find(u => u.id === parseInt(req.params.id));
        if (user) {
            res.json(user);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Обработчик для создания нового пользователя
app.post('/users', async (req, res) => {
    try {
        const users = await readUsersFromFile();
        const newUser = req.body;
        newUser.id = getNextUserId(users);
        users.push(newUser);
        await writeUsersToFile(users);
        res.json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Обработчик для обновления пользователя по ID
app.put('/users/:id', async (req, res) => {
    try {
        const users = await readUsersFromFile();
        const userId = parseInt(req.params.id);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            const updatedUser = req.body;
            updatedUser.id = userId;
            users[userIndex] = updatedUser;
            await writeUsersToFile(users);
            res.json(updatedUser);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Обработчик для удаления пользователя по ID
app.delete('/users/:id', async (req, res) => {
    try {
        const users = await readUsersFromFile();
        const userId = parseInt(req.params.id);
        const filteredUsers = users.filter(u => u.id !== userId);

        if (filteredUsers.length < users.length) {
            await writeUsersToFile(filteredUsers);
            res.send('User deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Функция для чтения пользователей из файла
async function readUsersFromFile() {
    try {
        const data = await fs.readFile(usersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Функция для записи пользователей в файл
async function writeUsersToFile(users) {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// Функция для получения следующего идентификатора пользователя
function getNextUserId(users) {
    const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
    return maxId + 1;
}

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
