// Coil Peer
//
// peerId: UUID of Peer
// state: current state of peer [active, inactive]
// transport: Array of available transports
// maxVersion: vector clock of the last version seen
// publicKey: Public key of the peer
// lastContact: Last time there was an attempt to contact the peer

var microdb = require('nodejs-microdb');
var peers = new microdb({'file':'peers.db'});

var createPeer = function(peerId, state, transport, maxVersion, publicKey,lastContact){
	if (peerId == '') {
		return false;
	} else {
		peers.add({'peerId':peerId,'state':state,'transport':transport,'maxVersion':maxVersion,'publicKey':publicKey,'lastContact':lastContact},peerId);
		peers.flush();
		return true;
	}
}

var readPeer = function(id){
	var peer = peers.data[id];
	if(typeof peer == 'undefined' && peer == null) {
		return false;
	} else {
		return peer;
	}
}

var getPeer = function(key,direction) {
	// Key = column name, direction = asc, desc
	peer = peers.sortByKey(key,direction,false);
	return peer[0][0];
}
var updatePeer = function(id,state,transport,maxVersion,publicKey,lastContact){
	if(id.length) {
		if(peers.data[id]) {
			if (typeof state == 'undefined' || state == null) { state = peers.data[id].state; }
			if (typeof transport == 'undefined' || transport == null) { transport = peers.data[id].transport; }
			if (typeof maxVersion == 'undefined' || maxVersion == null) { maxVersion = parseInt(peers.data[id].maxVersion)+1; } else { maxVersion = parseInt(maxVersion) + 1; }
			if (typeof publicKey == 'undefined' || publicKey == null) { publicKey = peers.data[id].publicKey; }
			if (typeof lastContact == 'undefined' || lastContact == null) { lastContact = peers.data[id].lastContact; }
			if(deletePeer(id)) {
				createPeer(id,state,transport,maxVersion,publicKey,lastContact);
				peers.flush();
				console.log("[coil] [updatePeer] Peer: " + id + " updated successfully");
				return true;
			} else {
				console.log("[coil] [updatePeer] Fatal Error: Deletion during update failed");
				process.exit(1);
				return false;
			}
			console.log("deletePeer: " + deletePeer("1"));
		} else {
			console.log('[coil] [updatePeer] Peer ID not found: ' + id);
			return false;
		}
	} else {
		console.log('[coil] [updatePeer] No ID provided');
		return false;
	}
}
var deletePeer = function(id){
	if(readPeer(id)) {
		peers.del(id);
		peers.flush();
		return true;
	} else {
		return false;
	}
}
var readDigest = function(){
	digest = peers.findAll('state','alive');
	var output = '[';
	digest.forEach(function(value, index, array) {
		output = output + JSON.stringify(peers.data[value]) + ',';
	});
	if (output.length > 1) {
		output = output.substring(0,output.length - 1) + ']';
	} else {
		output = output + ']';
	}
	return output;
}
var updateDigest = function(input){
	input = JSON.parse(input);
	response = "[";
	input.forEach(function(value, index, array) {
		if (readPeer(value.peerId)) {
			if (value.maxVersion > peers.data[value.peerId].maxVersion) {
				updatePeer(value.peerId,value.state,value.transport,value.maxVersion,value.publicKey);
				console.log('[coil] [updateDigest] Updating Peer: ' + value.peerId);
			} else if (value.maxVersion < peers.data[value.peerId].maxVersion){
				response = response + JSON.stringify(peers.data[value.peerId]) + ',';
				console.log('[coil] [updateDigest] Delta Peer: ' + value.peerId);
			} else {
				console.log('[coil] [updateDigest] Matched Peer: ' + value.peerId);
			}
		} else {
		  createPeer(value.peerId, value.state, value.transport, value.maxVersion, value.publicKey, new Date().getTime());
			console.log('[coil] [updateDigest] Added New Peer: ' + value.peerId);
		}

	});
	response = response.substring(0,response.length -1) + ']';
	return response;
}

exports.createPeer = createPeer;
exports.readPeer = readPeer;
exports.updatePeer = updatePeer;
exports.deletePeer = deletePeer;
exports.readDigest = readDigest;
exports.updateDigest = updateDigest;
exports.getPeer = getPeer;
