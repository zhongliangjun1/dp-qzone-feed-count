
var bunyan = require('bunyan');

var log = bunyan.createLogger({
  name: 'myapp',
  streams: [
    {
      level: 'info',
      stream: process.stdout            // log INFO and above to stdout
    },
    {
      level: 'error',
      path: '/data/applogs/dp-qzone-feed-count/logs/app.log'  // log ERROR and above to a file
    }
  ]
});

exports.log = log;