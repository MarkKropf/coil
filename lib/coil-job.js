var CronJob = require('cron').CronJob;
var peer = require('./coil-peer.js');

var oldestPeer = new CronJob({
  cronTime: '*/5 * * * * *',
  onTick: function() {
    this.stop();
    oldPeer = peer.readPeer(peer.getPeer('lastContact','asc'));
    if(typeof oldPeer == 'undefined' || oldPeer === null || oldPeer === false) {
      console.log("[coil] [oldestPeer] No peers found");
    } else {
      oldPeer.transport.forEach(function(value, index, array) {
        if (oldPeer.peerId == nconf.get('peerId')) {
          // always update both sent/received timestamps for yourself
          peer.updatePeer(oldPeer.peerId,null,null,null,null,new Date().getTime(),new Date().getTime());
          oldestPeer.start();
        }
        else if (value.name == "coil-http") {
          console.log("[coil] [oldestPeer] Contacting peer: " + oldPeer.peerId + " via host: " + value.host + ":" + value.port);
          var http = require('http');
          var options = {
            host: value.host,
            port: value.port,
            path: '/digest/' + nconf.get('peerId'),
            method: 'PUT'
          };
          var req = http.request(options, function(res) {
            res.body="";
            if(res.statusCode==200) {
              res.on('data',function(chunk) {
                res.body+=chunk;
              });
              res.on('end',function() {
                peer.updateDigest(JSON.parse(res.body));
                peer.updatePeer(oldPeer.peerId,null,null,null,null,null,new Date().getTime());
                oldestPeer.start();
              });
            } else {
              console.log("[coil] [oldestPeer] Status code: " + res.statusCode + " while communicating to peerId" + oldPeer.peerId);
              oldestPeer.start();
            }
          });

          req.on('error', function(e) {
            console.log("[coil] [oldestPeer] Got error: " + e.message);
            peer.updatePeer(oldPeer.peerId,null,null,null,null,new Date().getTime());
            oldestPeer.start();
            console.log("http request options" + options);
          });

          req.write(JSON.stringify(JSON.parse(peer.readDigest()),null,2));
          req.end();
        }
      });
    }
  },
  onComplete: function() {
  },
  start: false
});

exports.oldestPeer = oldestPeer;
