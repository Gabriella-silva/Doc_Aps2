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
const clientes = conexaoBanco.define("Cliente", {  // Correção no nome da tabela
  id_cliente: {
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
  id_Mesa: {
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
  STATUS: {
    type: Sequelize.ENUM,
    values: ["Livre", "Ocupada"],
  }
});

const reservas = conexaoBanco.define("reservas", {
  id_reservas: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
});

// Cliente pode fazer várias reservas
reservas.belongsTo(clientes, { foreignKey: "id_cliente" });
clientes.hasMany(reservas, { foreignKey: "id_cliente" });

// Mesa pode estar associada a várias reservas
reservas.belongsTo(mesas, { foreignKey: "id_Mesa" });
mesas.hasMany(reservas, { foreignKey: "id_Mesa" });


// Sincronizar com o banco de dados
conexaoBanco.sync({ force: false });

// Middleware para processar dados do formulário
rotas.use(express.urlencoded({ extended: true }));
rotas.use(express.json());


// Rota para cadastrar cliente
rotas.post('/clientes', async (req, res) => {
  const { NomeCliente, telefone, endereço } = req.body;

  if (!NomeCliente || !telefone || !endereço) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios!' });
  }

  try {
    const novoCliente = await clientes.create({
      NomeCliente,
      telefone,
      endereço,
    });

    console.log('Novo cliente cadastrado:', novoCliente);
    res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso!', cliente: novoCliente });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar cliente', erro: error.message });
  }
});

// Rota para deletar uma mesa
rotas.delete("/mesas/:id", async (req, res) => {
  const { id } = req.params; // Obtém o id da mesa da URL

  try {
    // Verifica se a mesa existe
    const mesa = await mesas.findByPk(id);

    if (!mesa) {
      return res.status(404).json({ mensagem: 'Mesa não encontrada' });
    }

    // Exclui a mesa
    await mesa.destroy();

    return res.status(200).json({ mensagem: 'Mesa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir mesa:', error);
    return res.status(500).json({ mensagem: 'Erro ao excluir mesa', erro: error.message });
  }
});

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
// Rota para exibir todas as mesas
rotas.get("/todasreservas", async function (req, res) {
  try {
    const todasReservas = await reservas.findAll(); // Recupera todas as mesas
    res.json(todasReservas); // Retorna o resultado como JSON
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao buscar mesas: ${error.message}` });
  }
});

// Rota para editar a reserva
rotas.put('/reserva/:id', (req, res) => {
  const reservaId = parseInt(req.params.id);
  const reservaIndex = reservas.findIndex(r => r.id === reservaId);

  if (reservaIndex !== -1) {
      const { NomeCliente, nm_mesas, DataHora, TempoPermanencia, NumeroPessoas } = req.body;
      
      // Atualiza os dados da reserva
      reservas[reservaIndex] = {
          ...reservas[reservaIndex],
          NomeCliente,
          nm_mesas,
          DataHora,
          TempoPermanencia,
          NumeroPessoas
      };

      res.status(200).json({ mensagem: 'Reserva atualizada com sucesso!' });
  } else {
      res.status(404).json({ mensagem: 'Reserva não encontrada' });
  }
});

// Rota para buscar uma reserva específica
rotas.get('/reserva/:id', (req, res) => {
  const reservaId = parseInt(req.params.id);
  const reserva = reservas.find(r => r.id === reservaId);

  if (reserva) {
      res.status(200).json(reserva);
  } else {
      res.status(404).json({ mensagem: 'Reserva não encontrada' });
  }
});
// Rota para deletar uma reserva
rotas.get("/deletar/:id", async function (req, res) {
  const reservaId = req.params.id;

  try {
    // Tenta encontrar a reserva com o ID fornecido
    const reserva = await reservas.findByPk(reservaId);

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    // Excluir a reserva
    await reserva.destroy();

    return res.status(200).json({ message: 'Reserva excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);
    return res.status(500).json({ error: 'Erro ao excluir a reserva' });
  }
});
rotas.post("/reservas", async (req, res) => {
  const { NomeCliente, nm_mesas, DataHora, TempoPermanencia, NumeroPessoas } = req.body;

  // Validação dos dados recebidos
  if (!NomeCliente || !nm_mesas || !DataHora || !TempoPermanencia || !NumeroPessoas) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
  }

  try {
    // Procurar o ID do cliente pelo NomeCliente
    const clienteEncontrado = await clientes.findOne({
      where: { NomeCliente }
    });

    if (!clienteEncontrado) {
      return res.status(404).json({ mensagem: "Cliente não encontrado!" });
    }

    // Procurar o ID da mesa pelo número da mesa (nm_mesas)
    const mesaEncontrada = await mesas.findOne({
      where: { nm_mesas }
    });

    if (!mesaEncontrada) {
      return res.status(404).json({ mensagem: "Mesa não encontrada!" });
    }

    // Criar uma nova reserva
    const novaReserva = await reservas.create({
      id_cliente: clienteEncontrado.id_cliente, // Usando o ID do cliente encontrado
      id_Mesa: mesaEncontrada.id_Mesa, // Usando o ID da mesa encontrada
      DataHora,
      TempoPermanencia,
      NumeroPessoas
    });

    // Atualizar o status da mesa para "Ocupada"
    await mesas.update(
      { STATUS: "Ocupada" },
      { where: { id_Mesa: mesaEncontrada.id_Mesa } }
    );

    res.status(201).json({
      mensagem: "Reserva realizada com sucesso!",
      reserva: novaReserva
    });
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    res.status(500).json({ mensagem: `Erro ao criar reserva: ${error.message}` });
  }
});

// Rota PUT para editar reserva
rotas.put("/editarreservas/:id", async (req, res) => {
  const reservaId = req.params.id;  // Pega o ID da reserva a partir da URL

  if (!reservaId) {
      return res.status(400).json({ mensagem: "ID da reserva é obrigatório!" });
  }

  const { NomeCliente, nm_mesas, DataHora, TempoPermanencia, NumeroPessoas } = req.body;

  try {
      const reserva = await reservas.findByPk(reservaId);

      if (!reserva) {
          return res.status(404).json({ mensagem: "Reserva não encontrada!" });
      }

      // Atualiza os dados da reserva
      reserva.NomeCliente = NomeCliente;
      reserva.nm_mesas = nm_mesas;
      reserva.DataHora = DataHora;
      reserva.TempoPermanencia = TempoPermanencia;
      reserva.NumeroPessoas = NumeroPessoas;

      // Salva as mudanças
      await reserva.save();

      res.status(200).json({ mensagem: "Reserva atualizada com sucesso!" });
  } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      res.status(500).json({ mensagem: `Erro ao atualizar reserva: ${error.message}` });
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
// Rota para exibir todas as mesas
rotas.get("/todasmesas", async function (req, res) {
  try {
    const todasMesas = await mesas.findAll(); // Recupera todas as mesas
    res.json(todasMesas); // Retorna o resultado como JSON
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao buscar mesas: ${error.message}` });
  }
});
// Rota para criar uma nova mesa
rotas.post("/mesas", async function (req, res) {
  const { nm_mesas, capacidade, STATUS } = req.body;

  try {
    const novaMesa = await mesas.create({ nm_mesas, capacidade, STATUS });
    res.status(201).json({
      mensagem: "Mesa cadastrada com sucesso!",
      mesa: novaMesa,
    });
  } catch (error) {
    res.status(500).json({ mensagem: `Erro ao cadastrar mesa: ${error.message}` });
  }
});


// Iniciar o servidor
rotas.listen(3031, function () {
  console.log("Servidor rodando na porta 3031");
});
