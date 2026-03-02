# Tariff Classification System

A comprehensive web application for tariff classification featuring a React-based frontend, a Node.js/Express backend, and a Retrieval-Augmented Generation (RAG) classification model. This system provides an intelligent way to query, retrieve, and classify Harmonized Tariff Schedule (HTS) codes, integrating Airtable for data management and allowing document uploads for context-aware queries.

## 🚀 Features

- **Search & Classify Tariffs**: Identify the correct classification based on product descriptions.
- **RAG-powered Assistance**: Chat with an intelligent agent to ask questions about tariff codes and documents.
- **Context Management**: Add your own documents to be embedded and used as context for the RAG agent.
- **Airtable Integration**: Seamlessly syncs form submissions and data with your Airtable base.
- **Form Generation**: Supports automatic filling and downloading of specific template forms (like CI and SLI) via PDFs.

---

## 🏗️ Project Structure

The repository is divided into three main components:

1. **`frontend/tariff-app`**: A modern React application built with Vite.
2. **`backend`**: A robust Node.js and Express server that handles API requests, interacts with Airtable, manages PDF forms, and proxies requests to the RAG service.
3. **`rag`**: A Jupyter Notebook (`Tariff.ipynb`) containing the logic for the RAG system and tariff embeddings.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, HTML/CSS/JS
- **Backend**: Node.js, Express, Axios, `pdf-lib` (for PDF manipulation), Airtable API, CORS
- **RAG**: Python, Jupyter Notebook (intended for environments like Google Colab or local Jupyter servers)

---

## ⚙️ Prerequisites

To run this project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher is recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Optionally, [Python 3.x](https://www.python.org/) and Jupyter if you intend to run the RAG notebook locally.

---

## 💻 Installation & Setup

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the `backend` folder and configure the following values:
   ```env
   PORT=5000
   AIRTABLE_API_KEY=your_airtable_api_key_here
   AIRTABLE_BASE_ID=your_airtable_base_id_here
   AIRTABLE_TABLE_NAME=your_airtable_table_name_here
   COLAB_RAG_URL=https://your-ngrok-url.ngrok.io  # URL pointing to the running RAG service
   ```
4. Start the backend server:
   ```bash
   npm run dev  # For development (uses nodemon)
   # OR
   npm start    # For production
   ```

### 2. Frontend Setup

1. Navigate to the frontend application directory:
   ```bash
   cd frontend/tariff-app
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file in the `frontend/tariff-app` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api   # Point to your backend server
   VITE_RAG_URL=https://your-ngrok-url.ngrok.io  # Same URL as backend if accessing RAG directly
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the URL provided by Vite (typically `http://localhost:5173`).

### 3. RAG Setup

1. Open `rag/Tariff.ipynb` in your preferred notebook environment (e.g., Google Colab, JupyterLab).
2. Follow the instructions within the notebook to install any necessary Python dependencies, configure API keys (if applicable), and spin up the RAG endpoint.
3. If running via Colab, tunnel the endpoint (e.g., using ngrok) and update `COLAB_RAG_URL` in your backend `.env` file and `VITE_RAG_URL` in your frontend `.env` file.

---

## 📡 API Endpoints (Backend)

The backend provides several key routes:

- **`/api/rag`**: Endpoints for communicating with the RAG service.
  - `POST /api/rag/ask`: Submit questions to the RAG model.
  - `GET /api/rag/hts/:htsCode`: Get related information for an HTS code.
  - `POST /api/rag/add-documents`: Upload contextual documents.
  - `POST /api/rag/update-url`: Update the remote or Colab URL.
- **`/api/airtable`**: Endpoints for Airtable operations.
- **`/api/forms`**: Endpoints to handle form data and PDF creation.

---

## 📝 License

This project is licensed under the ISC License (as per backend `package.json`).
