
var redis = require("redis");

var PORT = 6379;
var HOST = '127.0.0.1';
var client = redis.createClient(PORT,HOST);

client.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});

client.on("connect", function () {
    console.log("success connect to " + HOST + ":" + PORT );
});



var unreadFeedCount = function(req, res, responseType) {

	var openId = req.params.openId;
    var unreadFeedCount = 0;
	if (openId) {
        var key = "user:"+openId+":unread:feedIds";
        client.smembers(key, function(err, feedIdSet){
            if (!err) {
                wrapResponse(res, responseType, {"unreadFeedCount":feedIdSet.length});
            } else {
                console.log(err);
                wrapResponse(res, responseType, {"unreadFeedCount":unreadFeedCount});
            }
        });
	} else {
        wrapResponse(res, responseType, {"unreadFeedCount":unreadFeedCount});
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