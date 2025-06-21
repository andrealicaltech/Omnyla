# Use the official Node.js 18 image as the base
FROM node:18-slim

# Install Java 17 and other dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    curl \
    gunzip \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Create pharmcat directory and download PharmCAT
RUN mkdir -p /app/pharmcat
WORKDIR /app/pharmcat

# Download PharmCAT (version 3.0.1)
RUN curl -L -O https://github.com/PharmGKB/PharmCAT/releases/download/v3.0.1/pharmcat-3.0.1-all.jar

# Download and extract preprocessor
RUN curl -L -O https://github.com/PharmGKB/PharmCAT/releases/download/v3.0.1/pharmcat-preprocessor-3.0.1.tar.gz \
    && tar -xzf pharmcat-preprocessor-3.0.1.tar.gz \
    && rm pharmcat-preprocessor-3.0.1.tar.gz

# Go back to app directory
WORKDIR /app

# Copy the rest of the application
COPY . .

# Create temp directory for VCF processing
RUN mkdir -p /app/temp

# Set permissions
RUN chmod +x /app/pharmcat/pharmcat-3.0.1-all.jar

# Build the Next.js application
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment variables
ENV PHARMCAT_JAR_PATH=/app/pharmcat/pharmcat-3.0.1-all.jar
ENV JAVA_PATH=/usr/lib/jvm/java-17-openjdk-amd64/bin/java

# Start the application
CMD ["pnpm", "start"] 