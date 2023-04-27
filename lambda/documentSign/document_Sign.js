const SimpleWebAuthn = require('@simplewebauthn/server');
const crypto = require('crypto');
const fs = require('fs');

// Generate a random symmetric key to encrypt the document
const symKey = crypto.randomBytes(32);

exports.handler = async (event, context, callback) => {

};



