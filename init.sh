#!/bin/bash

# HubLLM Development Environment Startup Script
# This script starts all services needed for development

set -e

# Check if already running
if curl -s http://localhost:8000/health >/dev/null 2>&1 && curl -s http://localhost:5173 >/dev/null 2>&1; then
    echo "✓ Environment already running!"
    echo "  Frontend:  http://localhost:5173"
    echo "  Backend:   http://localhost:8000"
    exit 0
fi

echo "🚀 Starting HubLLM Development Environment..."
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Run this script from the Hub-LLM root directory${NC}"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo -e "${YELLOW}Killing existing process on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Step 0: Clean up ghost databases (only keep backend/hubllm.db)
echo ""
echo -e "${GREEN}Step 0: Checking for ghost databases...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GHOST_DBS=$(find "$SCRIPT_DIR" -name 'hubllm.db' ! -path '*/backend/hubllm.db' 2>/dev/null || true)
if [ -n "$GHOST_DBS" ]; then
    echo -e "${YELLOW}  Found ghost database(s):${NC}"
    echo "$GHOST_DBS" | while read -r f; do echo "    $f (removing)"; rm -f "$f"; done
else
    echo "  No ghost databases found"
fi

# Step 1: Start Backend
echo ""
echo -e "${GREEN}Step 1: Starting Backend (FastAPI)...${NC}"
kill_port 8000

cd backend

# Check/create virtual environment
if [ ! -d "venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate and install deps
source venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null

# Start backend in background
echo "  Starting uvicorn..."
nohup uvicorn main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "  ✓ Backend started (PID: $BACKEND_PID)"

cd ..

# Wait for backend to be ready
echo "  Waiting for backend..."
sleep 3
for i in {1..10}; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo "  ✓ Backend is healthy"
        break
    fi
    sleep 1
done

# Step 2: Start Frontend
echo ""
echo -e "${GREEN}Step 2: Starting Frontend (Vite)...${NC}"
kill_port 5173

cd frontend

# Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "  Installing npm dependencies..."
    npm install --silent
fi

# Start frontend in background
echo "  Starting Vite dev server..."
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  ✓ Frontend started (PID: $FRONTEND_PID)"

cd ..

# Wait for frontend
sleep 3
for i in {1..10}; do
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo "  ✓ Frontend is ready"
        break
    fi
    sleep 1
done

# Step 3: Health Check
echo ""
echo -e "${GREEN}Step 3: Running Health Checks...${NC}"

# Backend health
BACKEND_HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null || echo '{"status":"error"}')
echo "  Backend: $BACKEND_HEALTH"

# Frontend check
if curl -s http://localhost:5173 >/dev/null 2>&1; then
    echo "  Frontend: OK"
else
    echo -e "${RED}  Frontend: Not responding${NC}"
fi

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}✓ HubLLM Development Environment Ready${NC}"
echo "=============================================="
echo ""
echo "  🌐 Frontend:  http://localhost:5173"
echo "  🔧 Backend:   http://localhost:8000"
echo "  📊 API Docs:  http://localhost:8000/docs"
echo "  🗄️  Database:  SQLite ($SCRIPT_DIR/backend/hubllm.db)"
echo ""
echo "  Logs:"
echo "    Backend:  tail -f backend.log"
echo "    Frontend: tail -f frontend.log"
echo ""
echo "  To stop all services:"
echo "    ./stop.sh  OR  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173 2>/dev/null &
elif command -v open &> /dev/null; then
    open http://localhost:5173 2>/dev/null &
fi

echo "Happy coding! 🎉"
