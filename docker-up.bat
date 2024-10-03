#!/bin/bash

# Navigate to api-gateway directory and run docker-compose in the background
cd backend/api-gateway
docker-compose -f docker-compose.api-gateway.yml up --build &

# Wait for the docker-compose process to finish
wait
