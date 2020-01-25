require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
const morgan = require('morgan'); //lib for logs
const path = require('path'); //lib for logs

mongoose
	.connect(process.env.DB_CONNECTION_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('Database connected');
	})
	.catch((err) => {
		console.error('Database connection failed, err:', err);
	});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(routes);
app.use(
	'/files',
	express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
);

app.listen(8888, () => {
	console.log('Server running');
});
