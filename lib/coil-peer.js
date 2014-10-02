// Coil Peer
//
// peerId: UUID of Peer
// state: current state of peer [active, inactive]
// transport: Array of available transports
// maxVersion: vector clock of the last version seen
// publicKey: Public key of the peer
// connReceived: Last time we received a successful connection from the peer
// connSent: Last time we successfully connected to the peer

var microdb = require('nodejs-microdb');
var peers = new microdb({'file':'peers.db'});

var createPeer = function(peerId,state,transport,maxVersion,publicKey,connReceived,connSent){
	if (peerId === '') {
		return false;
	} else {
		peers.add({'peerId':peerId,'state':state,'transport':transport,'maxVersion':maxVersion,'publicKey':publicKey,'connReceived':connReceived,'connSent':connSent},peerId);
		peers.flush();
		return true;
	}
};

var readPeer = function(id){
	var peer = peers.data[id];
	if(typeof peer == 'undefined' || peer === null) {
		return false;
	} else {
		return peer;
	}
};

var getPeer = function(key,direction) {
	// Key = column name, direction = asc, desc
	peer = peers.sortByKey(key,direction,false);
	if(typeof peer[0] == 'undefined' || peer === null) {
		return false;
	} else {
		return peer[0][0];
	}
};

var updatePeer = function(id,state,transport,maxVersion,publicKey,connReceived,connSent){
	if(id.length) {
		if(peers.data[id]) {
			if (typeof state == 'undefined' || state === null) { state = peers.data[id].state; }
			if (typeof transport == 'undefined' || transport === null) { transport = peers.data[id].transport; }
			if (typeof maxVersion == 'undefined' || maxVersion === null) { maxVersion = parseInt(peers.data[id].maxVersion) +1; } else { maxVersion = parseInt(maxVersion) + 1; }
			if (typeof publicKey == 'undefined' || publicKey === null) { publicKey = peers.data[id].publicKey; }
			if (typeof connReceived == 'undefined' || connReceived === null) { connReceived = peers.data[id].connReceived; }
			if (typeof connSent == 'undefined' || connSent === null) { connSent = peers.data[id].connSent; }
			peers.del(id);
			peers.flush();
			createPeer(id,state,transport,maxVersion,publicKey,connReceived,connSent);
			peers.flush();
			console.log('[coil] [updatePeer] Peer: ' + id + ' updated successfully');
			return true;
		} else {
			console.log('[coil] [updatePeer] Peer ID not found: ' + id);
			return false;
		}
	} else {
		console.log('[coil] [updatePeer] No ID provided');
		return false;
	}
};

var deletePeer = function(id){
	if(readPeer(id)) {
		peers.del(id);
		peers.flush();
		console.log('[coil] [deletePeer] Peer: ' + id + ' deleted successfully');
		return true;
	} else {
		return false;
	}
};

var readDigest = function(){
	digest = peers.findAll('state','alive');
	var output = '{"digest": [';
	digest.forEach(function(value, index, array) {
		output = output + JSON.stringify(peers.data[value]) + ',';
	});
	if (output.length > 1) {
		output = output.substring(0,output.length - 1) + ']}';
	} else {
		output = output + ']}';
	}
	return output;
};

var updateDigest = function(digest){
	if (typeof digest.digest.forEach != 'function') {
		digest = JSON.parse(digest);
		console.log('[coil] [updateDigest] ERROR: Non JSON in updateDigest');
	}
	var resHeader = '{"digest": [';
	var resBody = "";
	var resFooter = ']}';
	digest.digest.forEach(function(value, index, array) {
		if (readPeer(value.peerId)) {
			if (value.maxVersion > peers.data[value.peerId].maxVersion) {
				updatePeer(value.peerId,value.state,value.transport,value.maxVersion,value.publicKey);
				console.log('[coil] [updateDigest] Updating Peer: ' + value.peerId);
			} else if (value.maxVersion < peers.data[value.peerId].maxVersion){
				resBody = resBody + JSON.stringify(peers.data[value.peerId]) + ',';
				console.log('[coil] [updateDigest] Delta Peer: ' + value.peerId);
			} else {
				console.log('[coil] [updateDigest] Matched Peer: ' + value.peerId);
			}
		} else {
		  createPeer(value.peerId,value.state,value.transport,value.maxVersion,value.publicKey,0,0);
			console.log('[coil] [updateDigest] Added New Peer: ' + value.peerId);
		}
	});
	if(resBody.length>0) { resBody.substring(0,resBody.length -1); }

	var response = resHeader + resBody + resFooter;
	return response;
};

exports.createPeer = createPeer;
exports.readPeer = readPeer;
exports.updatePeer = updatePeer;
exports.deletePeer = deletePeer;
exports.readDigest = readDigest;
exports.updateDigest = updateDigest;
exports.getPeer = getPeer;
