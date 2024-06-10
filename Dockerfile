# Stage 1: Build backend
FROM node:18-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Stage 2: Build frontend
FROM node:18-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

# Stage 3: Run all services
FROM node:18-slim
WORKDIR /app

# Install Python, pip, and Mosquitto in the final stage
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv mosquitto

# Copy backend files
COPY --from=backend-build /app/backend /app/backend

# Copy frontend files
COPY --from=frontend-build /app/frontend /app/frontend

# Copy Python files
COPY python /app/python

# Copy Mosquitto files
COPY mosquitto/ /app/mosquitto

# Install backend and frontend dependencies in the final stage
WORKDIR /app/backend
RUN npm install
WORKDIR /app/frontend
RUN npm install

# Set up Python virtual environment and install Python dependencies
WORKDIR /app/python
RUN python3 -m venv venv
RUN ./venv/bin/pip install --no-cache-dir -r requirements.txt

# Set the working directory back to /app
WORKDIR /app

# Ensure the virtual environment's Python and pip are in the PATH
ENV PATH="/app/python/venv/bin:$PATH"

# Start Mosquitto, backend, frontend, and Python script
CMD ["sh", "-c", "mosquitto -c /app/mosquitto/config/mosquitto.conf -d && cd backend && npm start & cd .. & cd frontend && npm run web & cd python && ./venv/bin/python test.py"]
