
var redis = require("redis");
var log = require("../log").log;
var request = require("request");
var async = require("async");

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


var getUnreadFeedCountByCode = function(req, res, responseType) {
    var code = req.params.code;
    if (code && clientIsOK) {

        async.waterfall([
            function(callback){

                request(
                    {
                        url: 'https://graph.qq.com/oauth2.0/token',
                        form: {
                            'client_id':200002,
                            'client_secret':'44af9cac039c4c07b6ea5a7fabec1c31',
                            'grant_type':'authorization_code',
                            'redirect_uri':'http://www.dianping.com/authlogin', //重定向URL
                            'code':code
                        },
                        method: "POST"
                    }, function(error, response, body) {
                        var accessToken = null;
                        if(!error){
                            if (body.indexOf('access_token')>=0) {
                                var array = body.split('&');
                                accessToken = array[0].replace('access_token=', '');
                            } else {
                                error = new Error(body);
                            }
                        }
                        callback(error, accessToken);
                    }
                );

            },
            function(accessToken, callback){

                request(
                    {
                        url: 'https://graph.qq.com/oauth2.0/me?access_token='+accessToken,
                        method: "GET"
                    }, function(error, response, body) {
                        var openId = null;
                        if (!error) {
                            if (body.indexOf('openid')>=0) {
                                openId = body.split(":")[2].replace('"} );', '').replace('"', '');
                            } else {
                                error = new Error(body);
                            }
                        }
                        callback(error, openId);
                    }
                );

            },
            function(openId, callback){

                var unreadFeedCount = 0;
                var key = "user:"+openId+":unread:feedIds";
                client.smembers(key, function(error, feedIdSet){
                    if (!error) {
                        unreadFeedCount = feedIdSet.length;
                    }
                    callback(error, unreadFeedCount);
                });

            }
        ], function (error, unreadFeedCount) {

            if (error) {
                log.error(error);
                unreadFeedCount = 0;
            }
            sendQzoneResponse(res, responseType, unreadFeedCount);

        });

    } else {
        sendQzoneResponse(res, responseType, 0);
    }
}

var sendQzoneResponse = function(res, responseType, unreadFeedCount) {
    var result;
    if (unreadFeedCount>0) {
        result = {
            "code": 0,
            "message": "吃喝玩乐出红点+数字",
            "data": {
                "result": '"'+unreadFeedCount+'"'
            }
        }
    } else {
        result = {
            "code": 0,
            "message": "不出红点",
            "data": {
                "result": "null"
            }
        }
    }
    wrapResponse(res, responseType, result);
}



var getUnreadFeedCountByOpenId = function(req, res, responseType) {

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


exports.getUnreadFeedCountByOpenIdOfJSON = function(req, res){
    getUnreadFeedCountByOpenId(req, res, 'json');
};

exports.getUnreadFeedCountByOpenIdOfJSONP = function(req, res){
    getUnreadFeedCountByOpenId(req, res, 'jsonp');
};

exports.keyCount = keyCount;

exports.getUnreadFeedCountByCodeOfJSONP = function(req, res){
    getUnreadFeedCountByCode(req, res, 'jsonp');
}