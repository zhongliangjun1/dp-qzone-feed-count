
var bunyan = require('bunyan');

var fs = require('fs');

if (!fs.existsSync('/data')) {
	fs.mkdirSync('/data');
};
if (!fs.existsSync('/data/applogs')) {
	fs.mkdirSync('/data/applogs');
};
if (!fs.existsSync('/data/applogs/dp-qzone-feed-count')) {
	fs.mkdirSync('/data/applogs/dp-qzone-feed-count');
};
if (!fs.existsSync('/data/applogs/dp-qzone-feed-count/logs')) {
	fs.mkdirSync('/data/applogs/dp-qzone-feed-count/logs');
};

var log = bunyan.createLogger({
  name: 'dp-qzone-feed-count',
  streams: [
    {
      level: 'info',
      stream: process.stdout            // log INFO and above to stdout
    },
    {
      level: 'error',
      type: 'rotating-file',
      path: '/data/applogs/dp-qzone-feed-count/logs/app.log',  // log ERROR and above to a file
      period: '1d',   // daily rotation
      count: 14        // keep 14 back copies
    }
  ]
});

exports.log = log;