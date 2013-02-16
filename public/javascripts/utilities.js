var url_helper = require('url'),
    dns = require('dns'),
    request = require('request'),
    validator = require('validator'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    prettyjson = require('prettyjson') ;

var blacklist_url = [];
var blacklist_ip = [];

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
        console.log("url to block : " + parsed);
        if(!(parsed in blacklist_url)){
            blacklist_url.push(parsed);
            dns.resolve4(parsed,function(err,addrs){
                for(var i = 0; i < addrs.length; i++){
                    if(blacklist_ip.indexOf(addrs[i]) == -1){
                        blacklist_ip.push(addrs[i]);
                    }
                }
                console.log("ips blocked : " + blacklist_ip);
            });
            console.log("urls blocked: " + blacklist_url);
        }
    }catch(e){
        console.log("Error in blockURLHandler: " + e);
    }
    
};
exports.blockIPHandler = function(ip){
   try{
        check(ip).isIP();
        console.log(ip);
        if(blacklist_ip.indexOf(ip) == -1){
            blacklist_ip.push(ip);
        }
        dns.reverse(ip,function(err,domains){
            if(domains !== undefined){
                for(var i = 0; i < domains.length;i++){
                    var parsed = url_helper.parse(domains[i]).path;
                    parsed = parsed.replace("www.","");
                    console.log(parsed);
                    if(blacklist_url.indexOf(parsed) == -1){
                        blacklist_url.push(parsed);
                    }
                }
            }
            console.log("blocked urls : " + blacklist_url);
            console.log("blocked ips : " + blacklist_ip);
        });
    }catch(e){
        console.log("in blockIPHandler : " + e);
    }

};


exports.requestHandler = function(req,res){
    var host = url_helper.parse(req.url).hostname;
    host = host.replace("www.","");
    // console.log("host : ".blue + host);
    // console.log("request header".blue);
    // console.log(prettyjson.render(req.headers));
    if(blacklist_url.indexOf(host) == -1 && blacklist_ip.indexOf(host) == -1){
    //     console.log("Sending proxy request... \n");
        var proxy_res = request(req.url,function(err,pr,body){
            console.log("response header for : ".blue + req.url);
            console.log(prettyjson.render(pr.headers));
        });
        proxy_res.pipe(res);

    }else{
        res.writeHead(403,"Forbidden");
        res.end();
    }

 };