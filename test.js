/**
 * Created with JetBrains WebStorm.
 * User: liangjun.zhong
 * Date: 14-6-12
 * Time: PM6:36
 * To change this template use File | Settings | File Templates.
 */

var request = require("request");


var code = '046C75C2EC578DB3962ED0853426A499';
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
        if (!error) {
            console.log("success");
            console.log(body);
        } else {
            console.log("failure");
            console.log(error);
        }
    }
)

request(
    {
        url: 'https://graph.qq.com/oauth2.0/me?access_token=630EFB9A3949738533C4A8244024F97B',
        method: "GET"
    }, function(error, response, body) {
        if (!error) {
            console.log("success");
            console.log(body);
        } else {
            console.log("failure");
            console.log(error);
        }
    }
)


var err = new Error('test');
console.log(err);