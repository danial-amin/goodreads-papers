# PaperReads

A modern, sleek Goodreads alternative for research papers with intelligent recommendation system.

## Features

- 📚 **Paper Management**: Browse, search, and organize research papers
- 🎯 **Smart Recommendations**: Get personalized paper recommendations based on your reading history and interests
- 📊 **Reading Tracking**: Track papers you want to read, are reading, or have completed
- ⭐ **Rating System**: Rate papers and mark favorites
- 🔍 **Advanced Search**: Search by title, authors, keywords, and abstracts
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- 🐳 **Docker Support**: Easy deployment with Docker containers

## Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Production database (SQLite for local dev)
- **scikit-learn**: Machine learning for recommendations
- **sentence-transformers**: Text similarity calculations

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Router**: Client-side routing

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- (Optional) Node.js 20+ and Python 3.11+ for local development

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd goodreads-papers
```

2. (Optional) Create a `.env` file to customize database credentials:
```bash
POSTGRES_USER=paperreads
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=paperreads
```

3. Start the services:
```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Database: localhost:5432 (PostgreSQL)

### Database Service

The application uses PostgreSQL as an isolated service with persistent storage:

- **Database Service**: Runs in a separate container with its own volume
- **Data Persistence**: Database data persists across container restarts via Docker volumes
- **Health Checks**: Backend waits for database to be ready before starting
- **CI/CD Ready**: Database credentials can be overridden via environment variables

#### Database Configuration

The database service is configured in `docker-compose.yml` and supports environment variable overrides:

```bash
# Default values (can be overridden)
POSTGRES_USER=paperreads
POSTGRES_PASSWORD=paperreads_password
POSTGRES_DB=paperreads
POSTGRES_PORT=5432
```

For CI/CD, you can override these values:
```bash
export POSTGRES_USER=ci_user
export POSTGRES_PASSWORD=ci_password
export POSTGRES_DB=ci_paperreads
docker-compose up -d database  # Start only database
docker-compose up -d backend frontend  # Start app services
```

#### Database Persistence

The database uses a named Docker volume (`database-data`) that persists data across:
- Container restarts
- Service updates
- CI/CD pipeline runs (when volume is preserved)

To backup the database:
```bash
docker exec paperreads-database pg_dump -U paperreads paperreads > backup.sql
```

To restore:
```bash
docker exec -i paperreads-database psql -U paperreads paperreads < backup.sql
```

### Local Development

#### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload
```

#### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
goodreads-papers/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database.py             # Database configuration
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic schemas
│   ├── recommendation_engine.py # Recommendation logic
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Backend Docker config
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── context/            # React context
│   │   └── App.jsx             # Main app component
│   ├── package.json            # Node dependencies
│   └── Dockerfile              # Frontend Docker config
├── docker-compose.yml          # Docker orchestration
└── README.md                   # This file
```

## API Endpoints

### Papers
- `GET /api/papers` - Get all papers (with optional search)
- `GET /api/papers/{id}` - Get a specific paper
- `POST /api/papers` - Create a new paper
- `PUT /api/papers/{id}` - Update a paper
- `DELETE /api/papers/{id}` - Delete a paper
- `GET /api/papers/{id}/similar` - Get similar papers

### Users
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create a new user

### Recommendations
- `GET /api/users/{id}/recommendations` - Get personalized recommendations

### Interactions
- `POST /api/interactions` - Record user interaction with a paper
- `GET /api/users/{id}/interactions` - Get user's interactions

## Recommendation Algorithm

The recommendation engine uses:
- **TF-IDF Vectorization**: Converts paper text (title, abstract, keywords) into numerical vectors
- **Cosine Similarity**: Calculates similarity between papers
- **User Profile**: Builds a user profile from their reading history and ratings
- **Weighted Scoring**: Higher weights for favorited papers and rated papers

## Adding Sample Data

You can add papers via the API or directly through the database. Example:

```python
POST /api/papers
{
  "title": "Attention Is All You Need",
  "authors": "Vaswani et al.",
  "abstract": "The dominant sequence transduction models...",
  "venue": "NeurIPS",
  "year": 2017,
  "keywords": "transformer, attention, NLP",
  "url": "https://arxiv.org/abs/1706.03762"
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
