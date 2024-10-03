#!/bin/bash

# Navigate to api-gateway directory and run docker-compose in the background
cd backend/api-gateway
docker-compose up --build &


# Wait for both docker-compose processes to finish
wait
