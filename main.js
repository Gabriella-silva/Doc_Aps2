const express = require("express");
const rotas = express();
const Sequelize = require("sequelize");
const Cors = require('cors')

rotas.use(Cors())
rotas.use(express.json());

// Conexão com o banco de dados MySQL
const conexaoBanco = new Sequelize("teste", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// Autenticação de conexão com o banco de dados
conexaoBanco.authenticate()
  .then(() => {
    console.log("Conexão com o banco de dados foi bem-sucedida.");
  })
  .catch((error) => {
    console.error("Não foi possível conectar ao banco de dados:", error);
  });

// Definição das tabelas com as chaves primárias e relacionamentos

const estabelecimentos = conexaoBanco.define("estabelecimetos", {
  id_estabelecimento: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome: {
    type: Sequelize.STRING,
  },
  telefone: {
    type: Sequelize.STRING,
  }
  endereço: {
    type: Sequelize.STRING,
  }
});

const mesas = conexaoBanco.define("mesas", {
  id_Estabelecimento: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nm_mesas: {
    type: Sequelize.INTEGER,
  },
  capacidade: {
    type: Sequelize.INTEGER,
  },
  Disponibilidade: {
    type: Sequelize.INTEGER,
  }
});


const reservas = conexaoBanco.define("reservas", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  NomeCliente: {
    type: Sequelize.STRING,
  },
  MesaID: {
    type: Sequelize.INTEGER,
  },
  DataHora: {
    type: Sequelize.DATETIME,
  },
  TempoPermanencia:{
    type : Sequelize.INTEGER,
  }
  NumeroPessoas{
    type: Sequelize.INTEGER,
  }
  STATUS{
    type: Sequelize.ENUM,
  }
});

const musica = conexaoBanco.define("musica", {
  id_musica: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_album: {
    type: Sequelize.INTEGER,
  },
  nome: {
    type: Sequelize.STRING,
  },
  duracao: {
    type: Sequelize.STRING,  // Altere de Sequelize.TIME para Sequelize.STRING
  }
});

// Sincronizar com o banco de dados
conexaoBanco.sync({ force: false });

// Rota para salvar um novo usuário
// Alteração na rota para salvar usuário, agora utilizando POST e corpo da requisição
rotas.post("/salvar", async function (req, res) {
  const { nome, email } = req.body;  // Agora pegamos os dados do corpo da requisição

  try {
    const novoUsuario = await Usuarios.create({ nome, email });
    res.json({
      resposta: "Usuário criado com sucesso",
      usuario: novoUsuario,
    });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao criar usuário: ${error.message}` });
  }
});


// Rota para deletar um usuário
rotas.get("/deletar/:id", async function (req, res) {
  const { id } = req.params;
  const idNumber = parseInt(id, 10);

  try {
    const usuario = await Usuarios.findByPk(idNumber);

    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    await Usuarios.destroy({
      where: { id_usuarios: idNumber },
    });

    res.json({ mensagem: "Usuário deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao deletar usuário: ${error.message}` });
  }
});

// Rota para editar um usuário
rotas.get("/editar/:id/:nome/:email", async function (req, res) {
  const { id, nome, email } = req.params;
  const idNumber = parseInt(id, 10);

  try {
    const [updated] = await Usuarios.update(
      { nome, email },
      {
        where: { id_usuarios: idNumber },
      }
    );

    if (updated) {
      res.json({
        mensagem: "Usuário atualizado com sucesso",
      });
    } else {
      res.status(404).json({ mensagem: "Usuário não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao editar usuário: ${error.message}` });
  }
});

// Rota para exibir todos os usuários
rotas.get("/mostrar", async function (req, res) {
  try {
    const todosUsuarios = await Usuarios.findAll();
    res.json(todosUsuarios);
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao buscar usuários: ${error.message}` });
  }
});

// Iniciar o servidor
rotas.listen(3031, function () {
  console.log("Servidor rodando na porta 3031");
});
