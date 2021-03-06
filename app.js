
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , feed = require('./routes/feed')
  , http = require('http')
  , path = require('path')
  , log = require('./log').log;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  //app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/qzone/json/openId/:openId/feed/unreadcount', feed.getUnreadFeedCountByOpenIdOfJSON);
//app.get('/qzone/jsonp/openId/:openId/feed/unreadcount', feed.getUnreadFeedCountByOpenIdOfJSONP);
app.get('/qzone/jsonp/user/:code/feed/unreadcount', feed.getUnreadFeedCountByCodeOfJSONP);
app.get('/qzone/json/keycount', feed.keyCount); 

http.createServer(app).listen(app.get('port'), function(err){
  if (!err) {
    log.warn("Express server listening on port " + app.get('port'));
  } else {
    log.error(err, "start failure");
  }
  
});
