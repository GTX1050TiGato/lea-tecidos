const express = require('express');
const bodyParser = require('body-parser');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configurar banco de dados
const adapter = new JSONFile(path.join(__dirname, 'db.json'));
const db = new Low(adapter);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Inicializar banco de dados
async function initializeDB() {
  await db.read();
  db.data ||= { clientes: [] };
  await db.write();
}

// Rotas
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/api/clientes', async (req, res) => {
  try {
    await db.read();
    
    const { name, surname, phone } = req.body;
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Formato de telefone inválido' });
    }

    const novoCliente = {
      id: Date.now(),
      nome: name,
      sobrenome: surname,
      telefone: phone,
      dataCadastro: new Date().toISOString()
    };

    db.data.clientes.push(novoCliente);
    await db.write();

    res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Iniciar servidor
initializeDB().then(() => {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
});