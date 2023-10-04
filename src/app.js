'use strict';
require('module-alias/register');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '50MB' }));
app.use(bodyParser.json({ limit: '50MB' }));
app.use(cors());
app.use('/poc', require('@routes'));

app.listen(process.env.APPLICATION_PORT, (res, err) => {
	if (err) onError(err);
	console.log('POC Environment: ' + process.env.NODE_ENV);
	console.log('POC is running on the port:' + process.env.APPLICATION_PORT);
});
