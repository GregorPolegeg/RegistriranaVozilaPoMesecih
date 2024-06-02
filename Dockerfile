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

# Stage 3: Install Python dependencies
FROM python:3.10-slim AS python-build
WORKDIR /app/python
COPY python/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY python/ ./

# Ensure Python scripts are executable
RUN chmod +x *.py

# Stage 4: Run all services
FROM node:18-slim
WORKDIR /app

# Copy backend files
COPY --from=backend-build /app/backend /app/backend

# Copy frontend files
COPY --from=frontend-build /app/frontend /app/frontend

# Copy Python files
COPY --from=python-build /app/python /app/python

# Install Python in final stage
RUN apt-get update && apt-get install -y python3 python3-pip

# Install backend and frontend dependencies in the final stage
WORKDIR /app/backend
RUN npm install
WORKDIR /app/frontend
RUN npm install

# Set the working directory back to /app
WORKDIR /app

# Start backend, frontend, and Python scripts
CMD ["sh", "-c", "cd backend && npx prisma generate && npm start & cd .. & cd frontend && npm run start"]
