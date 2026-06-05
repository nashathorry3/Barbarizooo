# ---- Build stage: compile the Spring Boot app with Maven + JDK 21 ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first (only re-downloads when pom.xml changes).
COPY pom.xml .
RUN mvn -q dependency:go-offline

# Then build the application.
COPY src ./src
RUN mvn -q clean package -DskipTests

# ---- Run stage: slim JRE, no build tooling ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Run as a non-root user.
RUN useradd --system --uid 1001 spring
USER spring

COPY --from=build /app/target/barbarizoo-backend-0.1.0.jar app.jar

# Cloud Run / Render inject PORT; the app reads it via server.port=${PORT:8080}.
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=postgres

ENTRYPOINT ["java", "-jar", "app.jar"]
