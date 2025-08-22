const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const airtableRoutes = require('./routes/airtable.js');
const ragRoutes = require('./routes/rag.js');
// const formsRoutes = require('./routes/forms.js');
// const errorHandler = require('./middleware/errorHandler.js');

dotenv.config('.env');

const app = express();
const PORT = process.env.PORT || 3001;

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