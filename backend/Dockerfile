FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace

# Cache Maven dependencies separately from application source.
COPY pom.xml ./
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
RUN mvn -B -ntp -DskipTests package

RUN JAR_FILE="$(find target -maxdepth 1 -type f -name "*.jar" ! -name "*.original" | head -n 1)" \
    && test -n "$JAR_FILE" \
    && cp "$JAR_FILE" /workspace/app.jar

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=build /workspace/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx256m", "-jar", "/app/app.jar"]
