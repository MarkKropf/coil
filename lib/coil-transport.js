// Coil Transport
//
// Host: Hostname or IP
// Port: Port number
// Path: Path prefix

var coilhttp = require('./transports/coil-http-transport.js');
var coiludp  = require('./transports/coil-udp-transport.js');

var initialize = function(transports,peer) {
	transports.forEach(function(value, index, array) {
		if(value.name=='coil-http') {
				coilhttp.server(value.host,value.port,peer);
		}
		if(value.name=='coil-udp') {
				coiludp.server(value.host,value.port);
		}
	});
	return true;
}

exports.initialize = initialize;
