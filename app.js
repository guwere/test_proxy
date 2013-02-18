

//routing, requesting,apllication etc modules
var express = require('express')
  , app = express()
  , http = require('http')
  , io = require('socket.io')
  , proxy_routes = require('./routes/proxy')
  , path = require('path');
  
//utilities,helpers,parsers modules
var js_functions = require('./public/javascripts/utilities.js');


// the server side express application configuration
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


//depending on the url a different route will be chosen
app.get('/', proxy_routes.index);
app.get('/mansys',proxy_routes.mansys);
app.get('/cache', proxy_routes.cache);

//the management system listen(a nodejs httpServer wrapped around express 
  // framework) on port 8009 at localhost
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server management system listening on port " + app.get('port'));
});

//the sockets.io module is used for easy server-client communication
//either side starts to listen for user defined events 
//either side can emit user defined events with user defined paramaters
//the socket is attached to the server i.e port 8009.
var sio = io.listen(server);
sio.set('log level', 1); // reduce logging


sio.sockets.on('connection', function (socket) {
    socket.on('block address',js_functions.blockURLHandler);
    socket.on('block ip',js_functions.blockIPHandler);
    socket.on('filter phrase',js_functions.filterPhrase);
});

//----------------------------------------
//proxy server with a requestListener(request,response) 
http.createServer(js_functions.requestHandler).listen(8008);

console.log("proxy listening on 8008...");
