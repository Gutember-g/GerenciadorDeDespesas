# Estágio 1: Build da aplicação Spring Boot
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copia pom.xml e faz cache das dependências de compilação
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia os fontes e compila o executável compactando sem rodar os testes unitários no build
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Ambiente de Execução (Runtime JRE leve)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia o JAR gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Define a porta padrão, que é reconfigurada dinamicamente pelo Render via variável PORT
ENV PORT=8080
EXPOSE ${PORT}

# Executa o JAR injetando a porta do Render via argumento do Spring
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
