// Coil HTTP Server
//
//

var http = require('http');

var server = function(host,port,peer) {
  var http = require('http');
  var url = require('url');
  var server = http.createServer().listen(port, host);
  server.on('request', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var method = req.method;
    var remoteAddress = req.connection.remoteAddress;
    var body = '';
    var requestData = '';
    var firstPart = '';
    var urlPath = url_parts.pathname;
    if (urlPath.indexOf("/",1)===-1) {
      firstPart = urlPath;
    } else {
      firstPart = urlPath.substring(0,urlPath.indexOf("/",1));
      peerId = urlPath.substring(urlPath.indexOf("/",1)+1);
    }

    switch(firstPart) {
      case '/':
      case '/index.html':
        body = '{"message": "Welcome to Coil","method": ' + method + '}';
        response_end();
        break;
      case '/digest':
        if (method =='GET') {
          body = JSON.stringify(JSON.parse(peer.readDigest()),null,2);
          response_end();
        } else {
          req.on('data', function(data) {
            requestData += data;
          });
          req.on('end', function() {
            body = peer.updateDigest(JSON.parse(requestData));
            peer.updatePeer(peerId,null,null,null,null,new Date().getTime());
            response_end();
          });
        }

        console.log("[coil] [httpserver] Digest " + method + " request received from " + peerId + " at " + remoteAddress);
        break;
      case '/delta':
        body = '{"message": "Empty"}';
        response_end();
        break;
      default:
        body = 'Unknown path: ' + JSON.stringify(urlPath);
        response_end();
    }

    function response_end() {
      res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/json' });
      res.write(body);
      res.end();
    }
  });
  console.log("[coil] [httpserver] HTTP Server Running: " + host + ":" + port);
};

exports.server = server;
