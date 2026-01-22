#!/bin/bash
echo "Setting up HubLLM development environment..."

# Copy environment file if it doesn't exist
if [ ! -f .env ]
then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Remember to add your API keys to .env!"
fi

# Start PostgreSQL with Docker
echo "Starting PostgreSQL..."
docker compose up db -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 5

# Install backend dependencies
echo "Installing Python dependencies..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "Setup complete!"
echo ""
echo "To start developing, run these commands in separate terminals:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev -- --host"
echo ""
echo "Frontend will open automatically at port 5173"
echo "Backend API available at port 8000"
echo ""
