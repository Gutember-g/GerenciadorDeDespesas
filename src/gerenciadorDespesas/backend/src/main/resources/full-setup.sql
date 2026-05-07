CREATE DATABASE IF NOT EXISTS gerenciador_despesas;
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'minhasenha123';
GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
