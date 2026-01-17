# New Features

## 🎉 Enhanced PaperReads Features

### 1. External Paper API Integration ✅

**What it does:**
- Fetches papers from external sources like arXiv and PubMed
- Automatically imports new papers into the database
- Keeps your collection up-to-date with latest research

**How to use:**
- Go to the Papers page
- Click "Fetch New Papers" button
- Papers from arXiv will be automatically imported
- You can also use the API endpoint: `POST /api/papers/fetch`

**Supported Sources:**
- **arXiv**: Computer science, physics, math, and more
- **PubMed**: Biomedical and life sciences papers

**API Example:**
```bash
POST /api/papers/fetch
{
  "sources": ["arxiv", "pubmed"],
  "max_per_source": 20,
  "query": "machine learning"  # Optional search query
}
```

---

### 2. Enhanced Recommendation Algorithm ✅

**What it does:**
- Uses TF-IDF vectorization and cosine similarity
- Learns from your reading history and ratings
- Provides personalized recommendations based on:
  - Papers you've read
  - Papers you've favorited
  - Your ratings
  - Similarity to your interests

**How it works:**
- Analyzes paper content (title, abstract, keywords)
- Builds a user profile from your interactions
- Calculates similarity scores
- Ranks papers by relevance

---

### 3. Conversational Chat Interface ✅

**What it does:**
- Chat with an AI assistant to get paper recommendations
- Natural language queries like "I'm interested in transformer models"
- Get personalized explanations for recommendations

**How to use:**
1. Navigate to the "Chat" page
2. Type your query in natural language
3. Get instant recommendations with explanations
4. Click on recommended papers to view details

**Example Queries:**
- "Show me papers about computer vision"
- "I'm interested in deep learning for NLP"
- "Find papers similar to what I've been reading"
- "Recommend papers on reinforcement learning"

**Features:**
- Real-time chat interface
- Context-aware recommendations
- Sidebar with recommended papers
- Click to view full paper details

**Note:** For best results, set `OPENAI_API_KEY` in your backend `.env` file. The system will work without it using keyword matching, but OpenAI provides better conversational understanding.

---

### 4. Interactive Paper Map Visualization ✅

**What it does:**
- Visual graph/map of all papers and their relationships
- Papers are connected based on similarity
- Search highlighting - papers matching your search are highlighted
- Interactive exploration - click nodes to see details

**How to use:**
1. Navigate to the "Map" page
2. Use the search bar to highlight matching papers
3. Click on any paper node to see details
4. Drag to pan, scroll to zoom
5. Click "Reset View" to return to overview

**Visual Features:**
- **Blue nodes**: Regular papers
- **Red nodes**: Papers matching your search
- **Green nodes**: Currently selected paper
- **Amber nodes**: Highlighted papers
- **Gray lines**: Similarity connections between papers

**Controls:**
- **Search**: Highlights matching papers in red
- **Click node**: Selects and zooms to paper
- **Click background**: Deselects and resets view
- **Refresh**: Reloads graph data

**Graph Structure:**
- Nodes represent papers
- Links represent similarity relationships
- Papers are grouped by venue when available
- Similar papers are automatically connected

---

## 🚀 Getting Started with New Features

### Setting up OpenAI (Optional but Recommended)

For the best chat experience, add your OpenAI API key:

1. Get an API key from https://platform.openai.com/
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=your_key_here
   ```
3. Restart the backend container

### Fetching External Papers

1. Go to Papers page
2. Click "Fetch New Papers"
3. Wait for papers to be imported
4. Browse the new papers!

### Using the Chat Interface

1. Make sure you have some papers in the database
2. Navigate to Chat page
3. Start chatting! Try:
   - "Show me papers about machine learning"
   - "I'm interested in neural networks"
   - "What papers are similar to what I've read?"

### Exploring the Paper Map

1. Navigate to Map page
2. Wait for graph to load
3. Try searching for keywords
4. Click on nodes to explore
5. Watch papers light up based on your search!

---

## 📊 Technical Details

### Recommendation Algorithm
- **Method**: TF-IDF + Cosine Similarity
- **Features**: Title, Abstract, Keywords
- **Weighting**: Ratings, favorites, read status
- **Performance**: Fast, scales to thousands of papers

### Graph Visualization
- **Library**: react-force-graph-2d
- **Layout**: Force-directed graph
- **Nodes**: Papers with metadata
- **Links**: Similarity relationships
- **Performance**: Optimized for 50-200 papers

### External APIs
- **arXiv**: Free, no API key required
- **PubMed**: Free, no API key required
- **Rate Limiting**: Built-in delays to respect API limits

---

## 🎯 Use Cases

1. **Stay Updated**: Fetch new papers regularly to keep your collection current
2. **Discover**: Use chat to find papers you didn't know you wanted
3. **Explore**: Use the map to visually discover paper relationships
4. **Research**: Combine all features for comprehensive paper discovery

---

## 🔧 Configuration

### Environment Variables

```bash
# Backend .env
DATABASE_URL=sqlite:///./data/paperreads.db
OPENAI_API_KEY=your_key_here  # Optional but recommended
```

### API Endpoints

- `POST /api/papers/fetch` - Fetch external papers
- `GET /api/papers/graph` - Get graph data
- `POST /api/chat/recommendations` - Chat recommendations

---

Enjoy exploring research papers in new and exciting ways! 🎉
