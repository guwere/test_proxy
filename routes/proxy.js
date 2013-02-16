var fs = require('fs');
/*
 * GET home page.
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

