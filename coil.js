var nconf = require('nconf');
var util = require('./lib/coil-util.js');
var crypto = require('./lib/coil-crypto.js');
var transport = require('./lib/coil-transport.js');
var socketio = require('socket.io');
var peer = require('./lib/coil-peer.js');
var job = require('./lib/coil-job.js');

// Initialization
util.welcome();
nconf.argv()
	 .env()
	 .file({ file: 'config.json'});

nconf.argv({
    "n": {
      alias: 'newidentity',
      describe: 'Generate a new identiy',
      demand: false,
    },
    "s": {
    	alias: 'seed',
    	describe: 'Add a seed node',
    	demand: false,
    }
  });

// First Run - Generate Identity
if(nconf.get('newidentity')) {
	var newId = crypto.createUuid();
	var newKeys = crypto.createKeys();
	var newPrivateKey = newKeys.private;
	var newPublicKey = newKeys.public;
	nconf.set('peerId',newId);
	nconf.set('state','alive');
	nconf.set('maxVersion','1');
	nconf.set('publicKey', newPublicKey);
	nconf.set('privateKey', newPrivateKey);
	if (peer.createPeer(newId,'','',newPublicKey)) {
		console.log('[coil] Successfully generated new identity');
	} else {
		console.log('[coil] Error while generating new identity');
	}
} else {
	if (!(nconf.get('peerId'))) {
		console.log('[coil] Error: No configuration data found');
		process.exit(1);
	}
}

// Load Available transports
if(!transport.initialize(nconf.get('transport'),peer)) {
	console.log("[coil] Error: No transports Found");
	process.exit(1);
}

// Coil Argument to provide seeds at execution
if(nconf.get('s')) {
	console.log('[coil] Loading new Seeds');
	if(nconf.get('seed')) {
		console.log('[coil] Error: No seed input provided');
		process.exit(1);
	} else {
		if(!(nconf.get('seeds'))) {
			nconf.set('seeds',[]);
		}
		nconf.get('seeds').push(nconf.get('seed'));
	}
}
// Check to make sure there are seeds in the config
if(!nconf.get('seeds')) {
	console.log('[coil] Error: No seeds found');
	process.exit(1);
}
// Load in seeds from the config and populate peer.db if empty
if (peer.readDigest().length <=2) {
	nconf.get('seeds').forEach(function(value, index, array) {
		peer.createPeer(value.peerId, value.state, value.transport, "0", value.publicKey, new Date().getTime());
		console.log("[coil] Adding seed peer: " + value.peerId);
	});
}

// Begin Connecting to peers
job.oldestPeer.start();

nconf.save(function (err) {
   if (err) {
     console.error(err.message);
     return;
   }
   console.log('Configuration saved successfully.');
});


// Crypto Test
//var priv_pem = nconf.get('privateKey');
//var pub_pem = nconf.get('publicKey');
//crypto.encryptMessage(pub_pem,"Hello World");
