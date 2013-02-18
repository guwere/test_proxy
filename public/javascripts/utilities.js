/*
utilities.js contains the logic "stuff" that has been
encorporated into the application. The main callback
functions that deal with blocking urls and ip addresses 
are here.
*/

var url_helper = require('url'),
    dns = require('dns'),
    request = require('request'),
    validator = require('validator'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    prettyjson = require('prettyjson') ;

var blacklist_url = [];
var blacklist_ip = [];
var phrases = [];

//adds a string phrase to the list of already phrases
// that need to be filtered
exports.filterPhrase = function(phrase){
    phrases.push(phrase);
    console.log(phrases);
};

/*a function that given an url will:
-check if it a valid url
-remove the www. from the url to add more generality
-check if the url is in the list of blocked urls
-if not then it adds it to the list and also adds all
    the ips addresses that resolve to that url to another
    list that contains the blocked ip addresses
*/
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

/*
a function that given an ip address will:
-check if it a valid ip address
-add the ip address to the list of ip addresses
-will reverse the ip address to its corresponding host url
    and add that url to the list of blocked urls. Note that
    for example reversing an ip addr of lets say google.com
    will not return the url google.com but the url of the host
    server so there is more to be desired in the implementation
    here.
*/
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

/*
a function that is a requestListener function(req,res)
that is emitted everytime there is a request.There may be
multiple requests per connection where req is an instance of 
http.ServerRequest and res is an instance of http.ServerResponse
the function will:
-get the url from the request
-remove the "www." part of it.Note that the url might be an ip string instead.
-see if it is in either of the blacklists.
    if it is then a response is send back to the client with 403 http code
    if it is not then a request is made through the request module for nodejs
    that can make fully customizable http requests where the only mandatory argument
    is the uri of the website.The other headers have defaults. Also based on the
    uri it will make the appropriate type of request i.e get,post, etc.
    -from the returned proxy responses- the body is inspected for blocked
     phrases and if there are such then a 403 response is send back to the client
     This feature does not work properly for now due to asynchrounous execution of
     node. In essense the piping begins in parallel with the body search in the 
     current implementation rendering the search useless even though is does in fact
     find the filtered phrases in the body. 
*/
exports.requestHandler = function(req,res){
    var host = url_helper.parse(req.url).hostname;
    host = host.replace("www.","");
    console.log("host : ".blue + host);
    console.log("request header".blue);
    console.log(prettyjson.render(req.headers));
    if(blacklist_url.indexOf(host) == -1 && blacklist_ip.indexOf(host) == -1){
        var block = -1;
        console.log("Sending proxy request... \n");
        var proxy_res = request(req.url,function(err,pr,body){
            console.log("response header for : ".blue + req.url);
            console.log(prettyjson.render(pr.headers));
            if(body !== undefined){
                for(var i = 0; i < phrases.length;i++){
                    block = body.search(phrases[i]);
                    if(block > -1){
                        console.log("Found the phrase ".red + phrases[i] + 
                            " at position ".red + block);
                    }
                }
            }
        });
        if(block == -1){
            //pipe incorporates all the necessary waiting,backpressure
            //handling and draining.
            proxy_res.pipe(res);
        }else{
            res.writeHead(403,"body of page contains inappropriate phrases");
            res.end();
        }

    }else{
        res.writeHead(403,"Forbidden");
        res.end();
    }

 };