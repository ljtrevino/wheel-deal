const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const bikesRouter = require('./routes/bikes');
const indexRouter = require('./routes/index');
const reviewsRouter = require('./routes/reviews');
const usersRouter = require('./routes/users');
const ridesRouter = require('./routes/rides');

const app = express();
app.use(session({ secret: "6170", resave: true, saveUninitialized: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', indexRouter);
app.use('/api/bikes', bikesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/rides', ridesRouter);

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});

module.exports = app;
