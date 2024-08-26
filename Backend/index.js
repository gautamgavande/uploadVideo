
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { databaseConnect } = require('./models/Database');
const videoRoutes = require('./routes/videoRoutes');

const app = express();

app.use(cors());
app.use(morgan('tiny'));

databaseConnect();

app.use('/api/v1', videoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
