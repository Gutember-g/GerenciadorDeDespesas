package com.saas.gerenciadordespesas.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String defaultJdbcUrl;

    @Value("${spring.datasource.username}")
    private String defaultUsername;

    @Value("${spring.datasource.password}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrlEnv = System.getenv("DATABASE_URL");
        HikariConfig config = new HikariConfig();

        if (databaseUrlEnv != null && !databaseUrlEnv.isEmpty()) {
            try {
                // Ajusta caso a plataforma forneça postgres:// em vez de postgresql://
                String processedUrl = databaseUrlEnv;
                if (processedUrl.startsWith("postgres://")) {
                    processedUrl = processedUrl.replace("postgres://", "postgresql://");
                }
                
                URI dbUri = new URI(processedUrl);
                
                // Extrai as informações de usuário e senha
                String userInfo = dbUri.getUserInfo();
                String username = "";
                String password = "";
                if (userInfo != null && userInfo.contains(":")) {
                    username = userInfo.split(":")[0];
                    password = userInfo.split(":")[1];
                }
                
                // Monta a JDBC URL correspondente
                String host = dbUri.getHost();
                int port = dbUri.getPort();
                if (port == -1) {
                    port = 5432;
                }
                String path = dbUri.getPath();
                
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=require";
                
                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
            } catch (URISyntaxException | NullPointerException e) {
                throw new RuntimeException("Erro ao processar a variável DATABASE_URL: " + e.getMessage(), e);
            }
        } else {
            // Caso DATABASE_URL não exista, usa os valores padrão definidos nos properties de prod
            config.setJdbcUrl(defaultJdbcUrl);
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
        }

        // HikariCP Connection Pool Settings - Otimizado para o Free Tier do Render
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(30000); // 30 segundos
        config.setMaxLifetime(600000); // 10 minutos
        config.setConnectionTimeout(20000); // 20 segundos
        config.setPoolName("GerenciadorDespesasHikariPoolProd");

        return new HikariDataSource(config);
    }
}
