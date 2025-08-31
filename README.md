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
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Data Persistence:** Browser Local Storage (self-contained, no backend needed)

## 🚀 Getting Started

This is a fully client-side application that runs entirely in your browser.

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, or Edge)

### Installation & Setup

1. **Clone or download the project** to your local machine

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Gemini API Key:**
   - Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
   - Create a `.env.local` file in the project root
   - Add your API key:
     ```
     VITE_API_KEY=your_gemini_api_key_here
     ```
   - **IMPORTANT:** Never hardcode your API key directly in the source code

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173` in your browser.

### Build for Production

To create a production build:
```bash
npm run build
```

### Troubleshooting

**Port 5173 is occupied:**
- Find the process: `netstat -ano | findstr :5173`
- Kill the process: `taskkill //PID <process_id> //F`
