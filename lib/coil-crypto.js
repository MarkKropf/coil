var uuid = require('node-uuid');
var forge = require('node-forge');
var Crypt = require('simple-crypt').Crypt;

var createUuid = function(){
	return uuid();
};

var createKeys = function(){
	keypair = forge.pki.rsa.generateKeyPair(2048, 65537);
  keypair.privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  keypair.publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
	return keypair;
};

var decryptMessage = function(priv_pem,data) {
	Crypt.make(priv_pem, function (err, decrypter)
	{
			decrypter.decrypt(data, function (err, decrypted)
			{
					if(err) {
						console.log("decryption error: " + err);
						return false;
					} else {
						return decrypted;
					}
			});
	});
};
var encryptMessage = function(pub_pem,data) {
	Crypt.make(pub_pem, function (err, encrypter)
	{
    encrypter.encrypt(data, function (err, encrypted)
    {
        if(err) {
					console.log("encryption error: " + err);
					return false;
				} else {
					return encrypted;
				}
    });
});
};

exports.createUuid = createUuid;
exports.createKeys = createKeys;
exports.encryptMessage = encryptMessage;
