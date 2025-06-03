const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3333;

const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Carregar banco de dados do arquivo JSON
let usersDatabase = { players: [], agents: [] };

if (fs.existsSync(DB_FILE)) {
    const rawData = fs.readFileSync(DB_FILE);
    try {
        usersDatabase = JSON.parse(rawData);
    } catch (err) {
        console.error('Erro ao ler database.json:', err);
    }
}

// Função auxiliar para salvar dados no arquivo JSON
function saveDatabase() {
    fs.writeFileSync(DB_FILE, JSON.stringify(usersDatabase, null, 2));
}

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de cadastro
app.post('/register', (req, res) => {
    const { registrationType, fullName, email, password, confirmPassword } = req.body;

    if (!registrationType || !fullName || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios!' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'As senhas não coincidem!' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'A senha deve ter pelo menos 6 caracteres!' });
    }

    const allUsers = [...usersDatabase.players, ...usersDatabase.agents];
    if (allUsers.some(user => user.email === email)) {
        return res.status(400).json({ success: false, message: 'Este e-mail já está cadastrado!' });
    }

    const newUser = {
        id: Date.now().toString(),
        type: registrationType,
        name: fullName,
        email,
        password,
        createdAt: new Date().toISOString()
    };

    if (registrationType === 'player') {
        usersDatabase.players.push(newUser);
    } else {
        usersDatabase.agents.push(newUser);
    }

    saveDatabase(); // Salvar após cada novo cadastro

    console.log('Novo usuário cadastrado:', newUser);
    res.json({ success: true, message: 'Cadastro realizado com sucesso!', user: { id: newUser.id, name: newUser.name } });
});

// Listar usuários
app.get('/users', (req, res) => {
    res.json({
        players: usersDatabase.players.map(u => ({ id: u.id, name: u.name, type: u.type })),
        agents: usersDatabase.agents.map(u => ({ id: u.id, name: u.name, type: u.type })),
        total: usersDatabase.players.length + usersDatabase.agents.length
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
