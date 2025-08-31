# Idea Factory 🚀

Welcome to Idea Factory, a powerful, AI-enhanced platform for capturing, managing, and analyzing your ideas. Built with React and powered by the Google Gemini API, this application transforms a simple idea list into an intelligent innovation hub.

## ✨ Features

### Core Idea Management
- **Add, Edit, and Publish:** Seamlessly create new ideas as drafts, refine them, and publish them when they're ready. Published ideas are locked to preserve their state.
- **Voting System:** Published ideas can be upvoted by users, allowing the best and most popular concepts to rise to the top.
- **Dashboard Overview:** A high-level dashboard visualizes key metrics like total ideas, total votes, and a breakdown of idea statuses (Draft vs. Published).
- **List & Detail Views:** View all your ideas at a glance or dive into a detailed view for a single idea.

### Advanced UI/UX
- **Card & Table Views:** Toggle between a visual card layout and a data-dense table view to suit your workflow.
- **Interactive Data Table:** The table view is a powerful data grid with:
  - **Column Sorting:** Sort ideas by title, status, votes, AI score, and cluster.
  - **Per-Column Filtering:** Drill down into your data with precise filters for each column.
  - **Pagination:** Efficiently navigate through a large number of ideas.
- **Bulk Operations:**
  - **Download (CSV):** Export all your ideas to a CSV file for backups or external analysis.
  - **Upload (CSV/JSON):** Add ideas in bulk by uploading a structured file.
  - **Download Template:** Get a pre-formatted CSV/JSON template to ensure your uploads are successful.

### 🤖 AI-Powered by Google Gemini

- **AI Idea Evaluation:**
  - Automatically evaluate any published idea on three key criteria: **Desirability, Feasibility, and Viability**.
  - The AI provides a score (1-10) and detailed reasoning for each criterion.
  - **Customizable Criteria:** Fine-tune the AI's focus by customizing the evaluation criteria on the Settings page.

- **AI Idea Clustering:**
  - **Batch Analysis:** Group your entire list of ideas into thematic clusters to uncover hidden patterns and relationships.
  - **User-Guided Clustering:** Configure the AI by telling it how many clusters to find and what basis to use for grouping (e.g., "target audience," "technology used").
  - **Save & Organize:** Save the AI-generated clusters, which then appear as a sortable and filterable column in your idea table.

- **AI Single Idea Classification:**
  - After creating clusters, you can classify new, un-clustered ideas with a single click.
  - The AI analyzes the new idea in the context of your existing clusters and suggests either adding it to an existing group or creating a new one.
  - You have the final say to accept or reject the AI's suggestion.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **Database:** SQLite
- **AI Integration:** Google Gemini API (`google-generativeai`)
- **Data Persistence:** SQLite database with persistent storage

## 🚀 Getting Started

This application consists of a FastAPI backend and a React frontend.

### Prerequisites

- **Python 3.8+**
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, or Edge)

### Installation & Setup

1. **Clone or download the project** to your local machine

2. **Backend Setup:**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Create environment file
   cp .env.example .env
   
   # Edit .env file and add your Gemini API key
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=sqlite:///./idea_factory.db
   ```

3. **Frontend Setup:**
   ```bash
   # Navigate back to root directory
   cd ..
   
   # Install Node.js dependencies
   npm install
   ```

4. **Configure Gemini API Key:**
   - Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
   - Add your API key to `backend/.env` file (see step 2 above)
   - **IMPORTANT:** Never hardcode your API key directly in the source code

### Running the Application

#### Option 1: Start Both Servers Together (Recommended)
```bash
npm run dev:full
```
This runs both frontend and backend concurrently in one terminal.

#### Option 2: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
python start.py
```
Backend runs on: `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```  
Frontend runs on: `http://localhost:5173`

#### Option 3: Backend Only (for API testing)
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Stopping the Application

#### If using `npm run dev:full`:
- Press `Ctrl+C` in the terminal (stops both servers)

#### If running servers separately:
- Press `Ctrl+C` in each terminal window

#### Force Stop (if processes are stuck):

**Windows:**
```bash
# Find and kill backend (port 8000)
netstat -ano | findstr :8000
taskkill //PID <process_id> //F

# Find and kill frontend (port 5173)  
netstat -ano | findstr :5173
taskkill //PID <process_id> //F
```

**Mac/Linux:**
```bash
# Kill backend
lsof -ti:8000 | xargs kill -9

# Kill frontend
lsof -ti:5173 | xargs kill -9
```

### Access Points

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`

### Build for Production

To create a production build of the frontend:
```bash
npm run build
```

### API Documentation

When the backend is running, you can view the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Troubleshooting

**Port conflicts:**
- Use the "Force Stop" commands above to kill stuck processes
- Or restart your terminal/computer if processes persist

**Database issues:**
- The SQLite database file (`idea_factory.db`) will be created automatically in the backend directory
- To reset the database, simply delete `backend/idea_factory.db` and restart the backend

**API Key issues:**
- Make sure your `backend/.env` file contains: `GEMINI_API_KEY=your_actual_api_key`
- Get your API key from [Google AI Studio](https://aistudio.google.com/)
- Restart the backend after updating the API key

**Common startup issues:**
- Make sure you've run `npm install` and `pip install -r requirements.txt`
- Check that Python 3.8+ and Node.js 18+ are installed
- Verify no other applications are using ports 8000 or 5173

### Quick Start Checklist

1. ✅ **Install Node.js dependencies**: `npm install`
2. ✅ **Install Python dependencies**: `cd backend && pip install -r requirements.txt`  
3. ✅ **Setup environment**: Create `backend/.env` with your Gemini API key
4. ✅ **Start application**: `npm run dev:full`
5. ✅ **Open browser**: Navigate to `http://localhost:5173`
