const express = require("express");
const path = require("path");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/ping', (req, res) => {
  return res.send('pong');
 });

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname + "public/index.html"));
});

module.exports = app;
