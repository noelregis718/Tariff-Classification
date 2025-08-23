# Tariff Classification App

A React application for tariff classification with RAG-powered question answering capabilities.

## Features

- Airtable integration for data management
- RAG (Retrieval-Augmented Generation) powered question answering
- Interactive data grid with cell editing
- Context-aware question answering based on selected data

## Setup

### Environment Variables

Create a `.env` file in the `frontend/tariff-app` directory with the following:

```bash
# For Airtable service (your local backend)
VITE_API_URL=https://your-backend-url.com

# For RAG service (Colab via ngrok)
VITE_RAG_URL=https://your-ngrok-url.ngrok-free.app
```

For development with ngrok:

```bash
VITE_API_URL=http://localhost:3000
VITE_RAG_URL=https://your-ngrok-url.ngrok-free.app
```

## API Integration

The app integrates with two main services:

1. **Airtable Service** (`/api/airtable/*`) - For data management via your local backend
2. **RAG Service** (`/ask`) - For intelligent question answering via Google Colab (accessible via ngrok)

## RAG Features

- Context-aware question answering based on selected table cells
- Source attribution with similarity scores
- Confidence scoring for answers
- Support for complex tariff classification queries

## Development

- Built with React 18 and Vite
- Uses custom hooks for API integration
- Responsive design with modern CSS
- Error handling and loading states
