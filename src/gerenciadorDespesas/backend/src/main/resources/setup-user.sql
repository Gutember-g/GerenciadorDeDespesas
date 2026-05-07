-- Comandos SQL para criar o usuário dedicado e conceder permissões
-- MySQL 8+ exige atenção especial com allowPublicKeyRetrieval e useSSL

CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'minhasenha123';
CREATE USER IF NOT EXISTS 'appuser'@'127.0.0.1' IDENTIFIED BY 'minhasenha123';

GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'localhost';
GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'127.0.0.1';

FLUSH PRIVILEGES;
