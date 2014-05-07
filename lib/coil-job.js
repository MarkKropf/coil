var CronJob = require('cron').CronJob;
var peer = require('./coil-peer.js');

var oldestPeer = new CronJob({
  cronTime: '*/5 * * * * *',
  onTick: function() {
    this.stop();
    oldPeer = peer.readPeer(peer.getPeer('lastContact','asc'));
    oldPeer.transport.forEach(function(value, index, array) {
      if(value.name == "coil-http") {
        console.log("[coil] [oldestPeer] Contacting peer: " + oldPeer.peerId + " via host: " + value.host + ":" + value.port);
        var http = require('http');
        var req = http.get("http://" + value.host + ":" + value.port + "/digest", function(res) {
          res.body="";
          if(res.statusCode==200) {
            res.on('data',function(chunk) {
              res.body+=chunk;
            });

            res.on('end',function() {
              peer.updateDigest(res.body);
              peer.updatePeer(oldPeer.peerId,null,null,null,null,new Date().getTime());
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
        });
      }
    });
  },
  onComplete: function() {
  },
  start: false
});

exports.oldestPeer = oldestPeer;
