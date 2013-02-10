var url_helper = require('url'),
    dns = require('dns'),
    request = require('request'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;

var blacklist = {};
var cache = {};

exports.addToCache = function(url,socket){
    try{
        //check(url).isUrl();
        var site = request(url,function(error,res,body){


        });
    }catch(e){
        console.log("Error in addToCache :"  + e);
    }
};


exports.refreshCache = function(socket){

};

exports.blockURLHandler = function(url){
    try{
        check(url).isUrl();
        var parsed = url_helper.parse(url).path;
        parsed = parsed.replace("www.","");
        console.log(parsed);
        if(!(parsed in blacklist)){
            dns.resolve4(parsed,function(err,addrs){
                console.log(addrs);
                blacklist[parsed] = addrs;
                console.log(blacklist);
            });
        }
    }catch(e){
        console.log("Error in blockURLHandler: " + e);
    }
    
};
exports.blockIPHandler = function(ip){
   try{
        check(ip).isIP();
        console.log(ip);
        dns.reverse(ip,function(err,domains){
            if(domains !== undefined){
                for(var i = 0; i < domains.length;i++){
                    var parsed = url_helper.parse(domains[i]).path;
                    parsed = parsed.replace("www.","");
                    console.log(parsed);
                    if(typeof blacklist[parsed] == 'undefined'){
                        blacklist[parsed] = [ip];
                    }else{
                        blacklist[parsed].push(ip);
                    }
                }
            }
            console.log(blacklist);
        });
    }catch(e){
        console.log(e);
    }

};


exports.requestHandler = function(req,res){
    var host = url_helper.parse(req.url).hostname;
    host = host.replace("www.","");
    if(typeof blacklist[host] == 'undefined'){
        //console.log(host);
        request(req.url).pipe(res);
    }else{
        res.writeHead(403,"Forbidden");
        res.end();
    }
    //console.log(host);
 };