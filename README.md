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

2. Start the services:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

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
