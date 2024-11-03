#!/bin/bash

# Define the docker-compose files with relative paths
COMPOSE_FILES=(
    "./docker-compose.yml"
    "./addon/chat/docker-compose.yml"
)

# Start each docker-compose file
for FILE in "${COMPOSE_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        docker-compose -f "$FILE" up -d
    else
        echo "File not found: $FILE"
    fi
done

# Copy .env.example to .env if .env does not exist
find . -name ".env.example" | while read -r EXAMPLE_FILE; do
    ENV_FILE="${EXAMPLE_FILE%.example}"
    if [ ! -f "$ENV_FILE" ]; then
        cp "$EXAMPLE_FILE" "$ENV_FILE"
        echo "Created .env from .env.example at $ENV_FILE"
    fi
done
