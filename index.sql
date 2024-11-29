

-- Tabela para "estabelecimentos"
CREATE TABLE IF NOT EXISTS estabelecimentos (
    id_estabelecimento INT AUTO_INCREMENT PRIMARY KEY,
    NomeCliente VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereço VARCHAR(255)
);

-- Tabela para "mesas"
CREATE TABLE IF NOT EXISTS mesas (
    id_mesa INT AUTO_INCREMENT PRIMARY KEY,
    id_Estabelecimento INT,
    nm_mesas INT NOT NULL,
    capacidade INT NOT NULL,
    Disponibilidade INT NOT NULL,
    FOREIGN KEY (id_Estabelecimento) REFERENCES estabelecimentos(id_estabelecimento) ON DELETE CASCADE
);

-- Tabela para "reservas"
CREATE TABLE IF NOT EXISTS reservas (
    id_reservas INT AUTO_INCREMENT PRIMARY KEY,
    NomeCliente VARCHAR(255) NOT NULL,
    MesaID INT NOT NULL,
    DataHora DATETIME NOT NULL,
    TempoPermanencia INT NOT NULL,
    NumeroPessoas INT NOT NULL,
    STATUS ENUM('pendente', 'confirmada', 'cancelada') NOT NULL,
    FOREIGN KEY (MesaID) REFERENCES mesas(id_mesa) ON DELETE CASCADE
);

-- Tabela "estabelecimentos", "mesas" e "reservas" estão criadas.
