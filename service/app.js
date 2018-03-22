var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var session = require('express-session');
var redisStore = require('connect-redis')(session);

var Redis = require('ioredis');

var cluster = new Redis.Cluster([{
  port: 7000,
  host: '192.168.0.184'
}, {
  port: 7001,
  host: '192.168.0.184'
},{
  port: 7002,
  host: '192.168.0.184'
},{
  port: 7003,
  host: '192.168.0.185'
},{
  port: 7004,
  host: '192.168.0.185'
},{
  port: 7005,
  host: '192.168.0.185'
},{
  port: 7006,
  host: '192.168.0.186'
},{
  port: 7007,
  host: '192.168.0.186'
},{
  port: 7008,
  host: '192.168.0.186'
}
]);

var options = {
   client:cluster
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    key: 'userData',
    secret: 'Sdkdandj9012ujKSADNlis',
    store: new redisStore(options),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 30*24*60*60*1000 },
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
