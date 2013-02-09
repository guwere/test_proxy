
/*
 * GET home page.
 */


exports.index = function(req,res){
	res.render('index',{title:'Trinity Proxy'});
};


exports.mansys = function(req, res){
  res.render('mansys', { title: 'ManSys' });
};
