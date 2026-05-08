CREATE DATABASE IF NOT EXISTS gerenciador_despesas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'minhasenha123';
CREATE USER IF NOT EXISTS 'appuser'@'127.0.0.1' IDENTIFIED BY 'minhasenha123';

ALTER USER 'appuser'@'localhost' IDENTIFIED BY 'minhasenha123';
ALTER USER 'appuser'@'127.0.0.1' IDENTIFIED BY 'minhasenha123';

GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'localhost';
GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'127.0.0.1';

FLUSH PRIVILEGES;
