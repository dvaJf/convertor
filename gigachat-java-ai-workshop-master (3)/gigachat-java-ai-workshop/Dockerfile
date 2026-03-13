FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

COPY pom.xml .
COPY src ./src

# Сборка зависимостей (без jar)
RUN mvn dependency:go-offline

# CMD запускает приложение напрямую через Maven
CMD ["mvn", "spring-boot:run"]