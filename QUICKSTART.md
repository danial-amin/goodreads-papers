# Quick Start Guide

## 🚀 Fastest Way to Get Started

### Option 1: Using the Startup Script (Recommended)

```bash
./start.sh
```

This script will:
- Build and start all Docker containers
- Wait for services to be ready
- Seed the database with sample papers
- Display access URLs

### Option 2: Manual Docker Compose

```bash
# Start services
docker-compose up --build -d

# Seed database (in a new terminal)
docker-compose exec backend python seed_data.py
```

### Option 3: Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📍 Access Points

Once running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 🧪 Testing the Application

1. **Browse Papers**: Navigate to http://localhost:5173/papers
2. **View Recommendations**: Go to http://localhost:5173/recommendations
3. **Search**: Use the search bar to find papers by title, authors, or keywords
4. **Interact**: Click on any paper to view details and mark your reading status

## 🛠️ Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up --build

# Access backend shell
docker-compose exec backend bash

# Access frontend shell
docker-compose exec frontend sh
```

## 📝 Adding Papers

### Via API
```bash
curl -X POST "http://localhost:8000/api/papers" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Paper Title",
    "authors": "Author Name",
    "abstract": "Paper abstract...",
    "venue": "Conference Name",
    "year": 2024,
    "keywords": "keyword1, keyword2"
  }'
```

### Via API Docs
Visit http://localhost:8000/docs and use the interactive interface.

## 🐛 Troubleshooting

**Port already in use?**
- Change ports in `docker-compose.yml` or stop conflicting services

**Database issues?**
- Remove the volume: `docker-compose down -v`
- Restart: `docker-compose up --build`

**Frontend not connecting to backend?**
- Check `VITE_API_URL` in frontend environment
- Ensure backend is running on port 8000

**Need to reset everything?**
```bash
docker-compose down -v
docker-compose up --build
docker-compose exec backend python seed_data.py
```
