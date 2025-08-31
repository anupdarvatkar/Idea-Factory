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

You need a modern web browser (like Chrome, Firefox, or Edge).

### Configuration: Gemini API Key

This application requires a Google Gemini API key to power its AI features. For security, the key is sourced from an environment variable.

1.  **Get a Gemini API Key:** Visit [Google AI Studio](https://aistudio.google.com/) to create your API key.
2.  **Set up the Environment Variable:** The application code looks for the key at `process.env.API_KEY`. You must configure the environment where you run this application to provide this variable.
    - **For Local Development (Example with Vite):**
      1.  Create a file named `.env.local` in the project's root directory.
      2.  Add the following line to the file, replacing `YOUR_API_KEY` with your actual key:
          ```
          VITE_API_KEY=YOUR_API_KEY
          ```
      3.  You would then access this in the code via `import.meta.env.VITE_API_KEY`. (Note: The current code uses `process.env.API_KEY`, which is typical for environments like Create React App or Node.js. You may need to adjust the code or your setup to match).
    - **For Deployment:** If you are deploying this to a hosting service (like Vercel, Netlify, etc.), use their "Secrets" or "Environment Variables" settings to add a variable named `API_KEY` with your key as the value.

**IMPORTANT:** Never hardcode your API key directly in the source code.

### Running the App

Once you have the files and have configured your environment, simply open the `index.html` file in your browser. All the necessary scripts are loaded from a CDN.
