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
const estabelecimentos = conexaoBanco.define("estabelecimentos", {  // Correção no nome da tabela
  id_estabelecimento: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  NomeCliente: {
    type: Sequelize.STRING,
  },
  telefone: {
    type: Sequelize.STRING,
  },
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
  id_reservas: {
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
    type: Sequelize.DATE,
  },
  TempoPermanencia: {
    type: Sequelize.INTEGER,
  },
  NumeroPessoas: {
    type: Sequelize.INTEGER,
  },
  STATUS: {
    type: Sequelize.ENUM,
    values: ['pendente', 'confirmada', 'cancelada'], // Exemplo de valores para STATUS
  }
});

// Sincronizar com o banco de dados
conexaoBanco.sync({ force: false });

// Rota para salvar uma nova reserva
rotas.post("/salvar", async function (req, res) {
  const { NomeCliente, MesaID, TempoPermanencia, NumeroPessoas, DataHora, STATUS } = req.body;  // Agora pegamos os dados do corpo da requisição

  try {
    const novaReserva = await reservas.create({ 
      NomeCliente, 
      MesaID, 
      TempoPermanencia,
      NumeroPessoas,
      DataHora,
      STATUS
    });
    res.json({
      resposta: "reserva criada com sucesso",
      reserva: novaReserva,
    });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao criar reserva: ${error.message}` });
  }
});

// Rota para deletar uma reserva
rotas.get("/deletar/:id", async function (req, res) {
  const { id } = req.params;
  const idNumber = parseInt(id, 10);

  try {
    const reserva = await reservas.findByPk(idNumber);

    if (!reserva) {
      return res.status(404).json({ mensagem: "Reserva não encontrada" });
    }

    await reserva.destroy();  // Alteração na lógica de deletar reserva

    res.json({ mensagem: "Reserva deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao deletar reserva: ${error.message}` });
  }
});

// Rota para editar uma reserva
rotas.get("/editar/:id/:NomeCliente/:MesaID", async function (req, res) {
  const { id, NomeCliente, MesaID } = req.params;
  const idNumber = parseInt(id, 10);

  try {
    const [updated] = await reservas.update(  // Alteração para usar o modelo correto
      { NomeCliente, MesaID },
      {
        where: { id_reservas: idNumber },
      }
    );

    if (updated) {
      res.json({
        mensagem: "Reserva atualizada com sucesso",
      });
    } else {
      res.status(404).json({ mensagem: "Reserva não encontrada" });
    }
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao editar reserva: ${error.message}` });
  }
});

// Rota para exibir todas as reservas
rotas.get("/mostrar", async function (req, res) {
  try {
    const todasReservas = await reservas.findAll();  // Alteração para usar o modelo correto
    res.json(todasReservas);
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao buscar reservas: ${error.message}` });
  }
});

// Iniciar o servidor
rotas.listen(3031, function () {
  console.log("Servidor rodando na porta 3031");
});
