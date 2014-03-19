// Coil UDP Server
//
//

var dgram = require("dgram");
var udpserver = dgram.createSocket("udp4");
var osc = require("a2r-osc");

udpserver.on("message", function (msg, rinfo) {
  msg = osc.fromBuffer(msg);
  console.log("[coil] [udpserver] server got: " + msg.address + " : " + msg.arguments + " from " + rinfo.address + ":" + rinfo.port);
});

udpserver.on("listening", function () {
  var address = udpserver.address();
  console.log("[coil] [udpserver] UDP Server Running: " + address.address + ":" + address.port);
});

var server = function(host,port) {
  udpserver.bind(port, host);
}

exports.server = server;
