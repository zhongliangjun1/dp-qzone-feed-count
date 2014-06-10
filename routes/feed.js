
var redis = require("redis");
var log = require("../log").log;
var request = require("request");

var PORT = 6379;
var HOST = '127.0.0.1';
var client = null;
var clientIsOK = false;

// export NODE_ENV=production|development
// export NODE_DP_ENV=dev|alpha|qa|prelease|product
var env = process.env.NODE_DP_ENV;
if (!env) {
    env = 'product';
};
//var env = 'prelease';
log.warn('now NODE_DP_ENV is '+env);

var createClient = function(){
    var url = "http://lion.dp:8080/getconfig?e="+env+"&k=dp-qzone-index-web.redis1.ip";
    request({
            url: url,
            method: "GET"
        }, function(error, response, body) {
            if (!error) {
                HOST = body;
                if ( isIP(HOST) ) {
                    client = redis.createClient(PORT,HOST);

                    client.on("error", function (err) {
                        log.error("error event - " + client.host + ":" + client.port + " - " + err);
                    });

                    client.on("connect", function () {
                        clientIsOK = true;
                        log.info("success connect to " + HOST + ":" + PORT );
                    });
                } else {
                    log.error('can not get effective redis HOST with the url : '+url);
                }                
            } else {
                log.error(error, 'can not get redis config with the url %s', url);
            }
        }
    )
}
createClient();

var isIP = function(str){
    var result = false;
    if (str) {
        var s = str.replace(/\./g,'');
        result = !isNaN(s);
    };
    return result;
}



var unreadFeedCount = function(req, res, responseType) {

	var openId = req.params.openId;
    var unreadFeedCount = 0;
	if (openId && clientIsOK) {
        var key = "user:"+openId+":unread:feedIds";
        client.smembers(key, function(err, feedIdSet){
            if (!err) {
                wrapResponse(res, responseType, {"unreadFeedCount":feedIdSet.length});
            } else {
                log.error(err);
                wrapResponse(res, responseType, {"unreadFeedCount":unreadFeedCount});
            }
        });
	} else {
        wrapResponse(res, responseType, {"unreadFeedCount":unreadFeedCount});
    }
}

var keyCount = function(req, res) {
    var count = 0;
    var responseType = 'json';
    if (clientIsOK) {
        client.dbsize( function (err, numKeys) {
            if (!err) {
                count = numKeys;
                wrapResponse(res, responseType, {"keyCount":count, "clientIsOK":clientIsOK, "withError":'n', "env":env});
            } else {
                log.error(err);
                wrapResponse(res, responseType, {"keyCount":count, "clientIsOK":clientIsOK, "withError":'y', "env":env});
            }
        });
    } else {
        wrapResponse(res, responseType, {"keyCount":count, "clientIsOK":clientIsOK, "withError":'y', "env":env});
    }
}

var wrapResponse = function(res, responseType, resultData){
    switch (responseType) {
        case 'jsonp':
            res.jsonp(resultData);
            res.end();
            break;
        case  'json':
            res.json(resultData);
            res.end();
            break
    }

}


exports.unreadFeedCountOfJSON = function(req, res){
    unreadFeedCount(req, res, 'json');
};

exports.unreadFeedCountOfJSONP = function(req, res){
    unreadFeedCount(req, res, 'jsonp');
};

exports.keyCount = keyCount;