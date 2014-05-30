
/*
 * GET test page.
 */

var fs = require('fs');

exports.index = function(req, res){
	var indexPage = fs.readFileSync('./views/client.html');
    res.writeHead(200, {'Content-type': 'text/html'});
    res.end(indexPage);
};