

//routing, requesting,apllication etc modules
var express = require('express')
  , app = express()
  , http = require('http')
  , io = require('socket.io')
  , proxy_routes = require('./routes/proxy')
  , path = require('path');
  
//utilities,helpers,parsers modules
var js_functions = require('./public/javascripts/utilities.js');



app.configure(function(){
  app.set('port', process.env.PORT || 8009);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use("/webpages", express.static(__dirname + '/webpages'));
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});



app.get('/', proxy_routes.index);
app.get('/mansys',proxy_routes.mansys);
app.get('/cache', proxy_routes.cache);


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server management system listening on port " + app.get('port'));
});
var sio = io.listen(server);
sio.set('log level', 1); // reduce logging


sio.sockets.on('connection', function (socket) {
    socket.on('block address',js_functions.blockURLHandler);
    socket.on('block ip',js_functions.blockIPHandler);
    socket.on('cache',function(url){
      js_functions.addToCache(url,socket);
    });
    socket.on('refresh request',function(unused){
      js_functions.refreshCache(socket);
    });
});

//----------------------------------------
//proxy server
http.createServer(js_functions.requestHandler).listen(8008);

console.log("proxy listening on 8008...");
