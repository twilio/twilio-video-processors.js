const express = require('express');
const { resolve } = require('path');

const app = express();
app.use(express.static(resolve(__dirname, './virtualbackground')));
app.use(express.static(resolve(__dirname, '../dist/build')));

app.get('/README.md', (req, res) => {
  res.sendFile(resolve(__dirname, './README.md'));
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`App server started. Go to http://localhost:${port}`);
});
