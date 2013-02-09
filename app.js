
<<<<<<< HEAD
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
=======
//routing, requesting,apllication etc modules
var express = require('express')
  , app = express()
  , http = require('http')
  , io = require('socket.io')
  , request = require('request')
  , proxy_routes = require('./routes/proxy')
  , path = require('path');
  
//utilities,helpers,parsers modules
var js_functions = require('./public/javascripts/utilities.js');

var blacklist = {};


app.configure(function(){
  app.set('port', process.env.PORT || 8009);
>>>>>>> first
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

<<<<<<< HEAD
app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
=======
app.get('/', proxy_routes.index);
app.get('/mansys',proxy_routes.mansys);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server management system listening on port " + app.get('port'));
});
var sio = io.listen(server);

sio.sockets.on('connection', function (socket) {
    socket.on('block address',js_functions.blockURLHandler);
    socket.on('block ip',js_functions.blockIPHandler);

});


//----------------------------------------
//proxy server
http.createServer(js_functions.requestHandler).listen(8008);

console.log("proxy listening on 8008...");
>>>>>>> first
