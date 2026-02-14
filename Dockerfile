# 1. Use Java JDK 20
FROM eclipse-temurin:20-jdk-alpine

# 2. Set a folder inside the container
WORKDIR /app

# 3. Copy your built JAR into the container
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

# 4. Expose port 8080 so we can access it
EXPOSE 8080

# 5. Run the JAR when container starts
ENTRYPOINT ["java","-jar","app.jar"]