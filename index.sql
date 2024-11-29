
-- Tabela Estabelecimentos
CREATE TABLE Estabelecimentos (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Endereco VARCHAR(255) NOT NULL,
    Telefone VARCHAR(15) NOT NULL
);

-- Tabela Mesas
CREATE TABLE Mesas (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    EstabelecimentoID INT NOT NULL,
    NumeroMesa INT NOT NULL,
    Capacidade INT NOT NULL,
    Disponibilidade BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (EstabelecimentoID) REFERENCES Estabelecimentos(ID)
);

-- Tabela Reservas
CREATE TABLE Reservas (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    NomeCliente VARCHAR(255) NOT NULL,
    EmailCliente VARCHAR(255) NOT NULL,
    MesaID INT NOT NULL,
    DataHora DATETIME NOT NULL,
    TempoPermanencia INT NOT NULL, -- Tempo de permanência em minutos
    NumeroPessoas INT NOT NULL,
    Status ENUM('pendente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendente',
    FOREIGN KEY (MesaID) REFERENCES Mesas(ID)
);
