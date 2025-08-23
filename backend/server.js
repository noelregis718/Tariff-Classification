const express = require('express');
const cors = require('cors');
const path = require('path');
const airtableRoutes = require('./routes/airtable.js');
const ragRoutes = require('./routes/rag.js');
// const formsRoutes = require('./routes/forms.js');
// const errorHandler = require('./middleware/errorHandler.js');

// Load environment variables from the correct path
require('dotenv').config('.env');

const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/airtable', airtableRoutes);
app.use('/api/rag', ragRoutes);

// // Error handling
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});