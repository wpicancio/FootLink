  // server.js
  const express = require("express");
  const path = require("path");
  const fs = require("fs");
  const multer = require("multer");
  const bcrypt = require("bcrypt");
  const app = express();
  const PORT = 3333;

  // Define o caminho para o arquivo do banco de dados JSON
  const DB_FILE = path.join(__dirname, "database.json");
  const uploadsDir = path.join(__dirname, "uploads");

  // --- Funções Auxiliares --- //
  function loadDatabase() {
      if (fs.existsSync(DB_FILE)) {
        const rawData = fs.readFileSync(DB_FILE, 'utf-8');
        try {
          return JSON.parse(rawData);
        } catch (err) {
          console.error("Erro ao analisar database.json:", err);
          return { players: [], agents: [] };
        }
      }
    return { players: [], agents: [] };
  }

  function saveDatabase() {
    fs.writeFileSync(DB_FILE, JSON.stringify(usersDatabase, null, 2));
  }

  // --- Middlewares --- //
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(__dirname));
  app.use("/uploads", express.static(uploadsDir));

  // --- Configurações do Multer --- //
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });

  const storagePost = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}${ext}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({ storage: storage });
  const uploadPost = multer({ storage: storagePost });

  // --- Inicialização do Banco de Dados --- //
  let usersDatabase = loadDatabase();
  usersDatabase.players = usersDatabase.players.map((player) => ({
    ...player,
    publicacoes: player.publicacoes || [],
    foto: player.foto || "",
  }));
  saveDatabase();

  // --- Rotas da Aplicação --- //

  // Rota GET para a página inicial
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  // Rota POST para registro de novos usuários
  app.post("/register", (req, res) => {
    const { registrationType, fullName, username, email, password, confirmPassword } = req.body;

    if (!registrationType || !fullName || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });
    }

    if (!username.startsWith("@")) {
      return res.status(400).json({ success: false, message: "O nome de usuário deve começar com @" });
    }

    const allUsers = [...usersDatabase.players, ...usersDatabase.agents];

    if (allUsers.some((user) => user.username === username)) {
      return res.status(400).json({ success: false, message: "Este nome de usuário já está em uso!" });
    }

    if (allUsers.some((user) => user.email === email)) {
      return res.status(400).json({ success: false, message: "Este e-mail já está cadastrado!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "As senhas não coincidem!" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "A senha deve ter pelo menos 6 caracteres!" });
    }

const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: Date.now().toString(),
    type: registrationType,
    name: fullName,
    email,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    foto: "",
    publicacoes: [],
  };


    if (registrationType === "player") {
      usersDatabase.players.push(newUser);
    } else {
      usersDatabase.agents.push(newUser);
    }

    saveDatabase();
    res.json({ success: true, message: "Cadastro realizado com sucesso!", user: { id: newUser.id, name: newUser.name } });
  });

  // Rota GET para listar usuários
  app.get("/users", (req, res) => {
    res.json({
      players: usersDatabase.players.map((u) => ({ id: u.id, name: u.name, type: u.type })),
      agents: usersDatabase.agents.map((u) => ({ id: u.id, name: u.name, type: u.type })),
      total: usersDatabase.players.length + usersDatabase.agents.length,
    });
  });

  // Rota POST para login de usuários
  app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    const dados = fs.readFileSync(DB_FILE, "utf-8");
    const usuarios = JSON.parse(dados);
    const usuario = usuarios.players.find((u) => u.email === email);

    if (!usuario) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const senhaConfere = bcrypt.compareSync(senha, usuario.password);

    if (!senhaConfere) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    if (usuario) {
      res.json({ mensagem: "Login bem-sucedido", usuario });
    } else {
      res.status(401).json({ erro: "Email ou senha inválidos" });
    }
  });

  // Rota POST para upload de foto de perfil
  app.post("/upload-foto", upload.single("foto"), (req, res) => {
    const { userId } = req.body;
    const jogador = usersDatabase.players.find((p) => p.id === userId);

    if (!jogador) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    jogador.foto = `/uploads/${req.file.filename}`;
    saveDatabase();

    res.json({ success: true, caminho: jogador.foto });
  });

  // Rota POST para publicar mídia
  app.post("/publicar-midia", uploadPost.single("midia"), (req, res) => {
    const { userId, texto, tipo } = req.body;
    const rawData = fs.readFileSync(DB_FILE);
    const usersDatabase = JSON.parse(rawData);
    
    const jogador = usersDatabase.players.find((p) => p.id === userId);

    if (!jogador) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    if (!jogador.publicacoes) {
      jogador.publicacoes = [];
    }

    const novaPublicacao = {
      id: Date.now().toString(),
      texto,
      data: new Date().toISOString(),
      midia: req.file ? `/uploads/${req.file.filename}` : null,
      tipoMidia: tipo || null
    };

    jogador.publicacoes.push(novaPublicacao);
    fs.writeFileSync(DB_FILE, JSON.stringify(usersDatabase, null, 2));

      res.json({ 
          success: true, 
          publicacao: {
              ...novaPublicacao,
              // Garanta que o caminho está absoluto
              midia: novaPublicacao.midia ? `http://localhost:3333${novaPublicacao.midia}` : null
          },
          usuario: jogador
      });
  });
  // Rota DELETE para excluir uma publicação
app.delete("/excluir-publicacao/:userId/:publicacaoId", (req, res) => {
  const { userId, publicacaoId } = req.params;

  const rawData = fs.readFileSync(DB_FILE);
  const usersDatabase = JSON.parse(rawData);

  const jogador = usersDatabase.players.find((p) => p.id === userId);

  if (!jogador) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  }

  const publicacaoIndex = jogador.publicacoes.findIndex((p) => p.id === publicacaoId);

  if (publicacaoIndex === -1) {
    return res.status(404).json({ success: false, message: "Publicação não encontrada." });
  }

  // Remove a publicação do array
  jogador.publicacoes.splice(publicacaoIndex, 1);

  fs.writeFileSync(DB_FILE, JSON.stringify(usersDatabase, null, 2));

  res.json({ success: true, message: "Publicação excluída com sucesso." });
});


  // Rota POST para editar perfil
  app.post("/editar-perfil", (req, res) => {
    const { userId, nome, bio } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "ID do usuário é obrigatório." });
    }

    const jogador = usersDatabase.players.find((p) => p.id === userId);
    if (!jogador) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    if (nome) jogador.name = nome;
    if (bio) jogador.bio = bio;

    saveDatabase();
    res.json({ success: true, message: "Perfil atualizado com sucesso!", usuario: jogador });
  });

  // Rota POST para logout
  app.post("/logout", (req, res) => {
    const { userId } = req.body;
    
    if (userId) {
      console.log(`Usuário ${userId} fez logout em ${new Date().toISOString()}`);
    }
    
    res.json({ success: true, message: "Logout realizado com sucesso!" });
  });

  // Início do Servidor
  app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
  });
