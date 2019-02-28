const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(morgan('dev'));
// app.use(express.static(__dirname));
// app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static('build'));
app.use(express.static('public'));

app.get('/ping',  (req, res) => res.send('pong'));

// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

module.exports = app;