'use strict';

// standard express app plumbing
const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');

app.use(morgan('dev'));
app.use(express.static('dist'));

app.get('/', (req, res) => {
  let template = 'index.html';

  if (process.env.NODE_ENV === 'production') {
    template = 'index.prod.html';
  }

  res.sendFile(path.join(__dirname, 'static', template));
});

const server = app.listen(3000, () => {
  console.log(`Web server listening at http://localhost:${server.address().port}`);
});

