# Checklist de Conexão com o Banco de Dados (MySQL 8 + Spring Boot 4)

Este documento descreve os pontos críticos para garantir que a aplicação Spring Boot consiga se conectar corretamente ao banco de dados MySQL 8.

## 1. Configuração da URL JDBC
Para o MySQL 8, a URL no `application.properties` deve conter parâmetros específicos para evitar falhas de handshake e segurança:
- [ ] `allowPublicKeyRetrieval=true`: Necessário quando o servidor MySQL usa autenticação `caching_sha2_password` (padrão no MySQL 8) e o SSL não está habilitado ou configurado totalmente.
- [ ] `useSSL=false`: Desabilita a exigência de SSL se o servidor não estiver configurado para tal (comum em ambientes de desenvolvimento).
- [ ] `serverTimezone=America/Sao_Paulo`: Evita erros de fuso horário entre a JVM e o servidor MySQL.
- [ ] `characterEncoding=UTF-8`: Garante o suporte correto a caracteres especiais e acentuação.
- [ ] `createDatabaseIfNotExist=true`: Opcional, mas útil para que o Hibernate crie o esquema automaticamente se ele não existir.

**Exemplo:**
`spring.datasource.url=jdbc:mysql://localhost:3306/gerenciador_despesas?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo&characterEncoding=UTF-8`

## 2. Usuários e Permissões no MySQL
Muitos problemas de "Access Denied" ocorrem por falta de privilégios ou host incorreto.
- [ ] O usuário `appuser` deve existir para os hosts `localhost` e `127.0.0.1`.
- [ ] O usuário deve ter todas as permissões (`GRANT ALL PRIVILEGES`) no banco de dados alvo.
- [ ] Execute `FLUSH PRIVILEGES` após criar ou alterar permissões.

**Script de Referência (`setup-user.sql`):**
```sql
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'minhasenha123';
CREATE USER IF NOT EXISTS 'appuser'@'127.0.0.1' IDENTIFIED BY 'minhasenha123';
GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'localhost';
GRANT ALL PRIVILEGES ON gerenciador_despesas.* TO 'appuser'@'127.0.0.1';
FLUSH PRIVILEGES;
```

## 3. Configurações de JPA e Hibernate
- [ ] `spring.jpa.hibernate.ddl-auto`: Use `update` para desenvolvimento (cria/altera tabelas) ou `validate` para produção.
- [ ] **Aviso de Dialeto**: Evite especificar `spring.jpa.properties.hibernate.dialect` explicitamente. O Hibernate 6+ (usado no Spring Boot 3+) detecta automaticamente a melhor versão para o MySQL 8. Remover essa linha evita avisos de depreciação e comportamentos inesperados.

## 4. Inicialização e Segurança (Spring Security)
- [ ] Certifique-se de que nenhum componente de segurança (como um `UserDetailsService` ou filtros customizados) tente acessar o banco de dados antes que a conexão esteja totalmente estabelecida.
- [ ] Use `@Lazy` em dependências que possam causar dependência circular entre Segurança e Repositórios.
- [ ] Se houver um `DataSeeder` (CommandLineRunner), garanta que ele use o `PasswordEncoder` para salvar senhas, caso contrário, o login falhará mesmo com a conexão ao banco funcionando.

## 5. Resumo de Erros Comuns
1. **Public Key Retrieval is not allowed**: Adicione `allowPublicKeyRetrieval=true` na URL.
2. **Access denied for user 'root'**: A aplicação está tentando usar `root` (talvez por falta de configuração no properties) ou a senha do `root` no seu MySQL não é vazia. Use um usuário dedicado como `appuser`.
3. **Access denied for user 'appuser'**: Verifique se o usuário foi criado para `localhost` E `127.0.0.1` e se a senha no `application.properties` coincide com a do banco.
