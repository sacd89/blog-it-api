const createError = require('http-errors');
const express = require('express');
const dotenv = require('dotenv');
const log4js = require('log4js');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {initLog} = require('./middlewares/logger/log4js.js');
const sequelize = require('./components/sql/sequelize.js');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users.routes');
const categoriesRouter = require('./routes/categories.routes');
const themesRouter = require('./routes/themes.routes');
const contentsRouter = require('./routes/contents.routes');

const app = express();

dotenv.config({ path: `./env/config.env` });

log4js.configure({
  appenders: {
    out: {
      type: 'stdout'
    },
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'trace'
    }
  }
});


app.use(initLog);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin(origin, callback) {
    callback(null, true);
  }
}));

const sqlConfig = {
  dialect: process.env.SQL_DIALECT,
  host: process.env.SQL_HOST,
  port: process.env.SQL_PORT,
  username: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  logging: false
};


sequelize.init(sqlConfig);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/themes', themesRouter);
app.use('/contents', contentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: true })
});

module.exports = app;
