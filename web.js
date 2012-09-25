var async   = require('async');
var express = require('express');
var util    = require('util');
var http = require('http');
var pageLocals = require('./middleware/pageLocals');
var bodyLimiter = require('./middleware/bodyLimiter');
var routes = require('./routes/index');

// create an express webserver
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.static(__dirname + '/public'));
  app.use(bodyLimiter);
  app.use(express.bodyParser());
  app.use(express.cookieParser('bdae@gkdl{dd}]fbafet;dsfasdfbxcwerd'));
  app.use(express.session({secret: process.env.SESSION_SECRET || 'secret123'}));
  app.use(pageLocals);
  app.use(require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID,
    secret: process.env.FACEBOOK_SECRET,
    scope:  'user_likes,user_photos,user_photo_video_tags'
  }));
});


var environment = process.env.environment || 'development';
// development only
if (environment == 'development') {
  console.log('In Development mode!');
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
}

// production only
if (environment == 'production') {
  console.log('In Production mode!');
  app.use(express.logger());
}

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Home becomes the only point of entry.
app.get('/', routes.home);
app.post('/', routes.home);
