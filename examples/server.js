const express = require('express');
const fs = require('fs');
const { resolve } = require('path');

const app = express();
app.use(express.static(resolve(__dirname, './virtualbackground')));
app.use(express.static(resolve(__dirname, '../dist/build')));

app.get('/:sampleMethod', (req, res) => {
  const { sampleMethod } = req.params;
  const indexPath = resolve(__dirname, 'virtualbackground', 'index.html');
  res.send(
    fs.readFileSync(indexPath, 'utf8')
      .replace(
        /<script src="(.+)twilio-video.js"><\/script>/,
        `<script src="twilio-video-${sampleMethod}.js"></script>`
      )
  );
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`App server started. Go to http://localhost:${port}`);
});
