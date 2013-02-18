var fs = require('fs');
/*
the different request listeners depending on the chosen 
route assigned in app.js
 */


exports.index = function(req,res){
	res.render('index',{title:'Trinity Proxy'});
};


exports.mansys = function(req, res){
  res.render('mansys', { title: 'ManSys' });
};

exports.cache = function(req, res){
    fs.readdir("./webpages",function(err,files){
        res.render('cache', { title: 'Local Cache',pages:files});

    });
};

