-- Comandos SQL para criar o usuário dedicado e conceder permissões
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'minhasenha123';
GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
