const express = require('express');
const cors = require('cors');
const path = require('path');
const airtableRoutes = require('./routes/airtable.js');
const ragRoutes = require('./routes/rag.js');
const formsRoutes = require('./routes/form.js');
// const formsRoutes = require('./routes/forms.js');
// const errorHandler = require('./middleware/errorHandler.js');

// Load environment variables from the correct path
require('dotenv').config('.env');

const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(express.json());

// Serve filled_forms as static files
app.use('/filled_forms', express.static(path.join(__dirname, 'filled_forms')));
app.get('/filled_forms/:formType/:fileName', (req, res) => {
  const { formType, fileName } = req.params;
  const filePath = path.join(__dirname, 'filled_forms', formType, fileName);
  res.download(filePath); 
});

// Routes
app.use('/api/airtable', airtableRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/forms', formsRoutes);

// // Error handling
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});