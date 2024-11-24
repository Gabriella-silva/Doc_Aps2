const express = require("express");
const app = express();
const Sequelize = require("sequelize");
const Cors = require('cors')

app.use(Cors())


const conexaoComBanco = new Sequelize("teste", "root", "", {
    host: "localhost",
    dialect: "mysql",
  });
  const musicas = conexaoComBanco.define("musica", {
    nm_musica: {
        type: Sequelize.STRING,
    },

    duracao: {
      type: Sequelize.TIME,
    },

  });
  
  Aluno.sync({ force: false });

  

  app.get("/mostrar", async function (req, res) {
    try {
        const musica = await musicas.findAll(); // Busca todos os registros
        res.json(musica); // Retorna os registros em formato JSON
    } catch (error) {
        res.status(500).json({ message: `Erro ao buscar alunos: ${error}` }); // Retorna erro ao cliente
    }
});
  
  app.listen(3030, function () {
    console.log("Server is running on port 3030");
  });

