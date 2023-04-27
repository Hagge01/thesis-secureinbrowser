const SimpleWebAuthn = require('@simplewebauthn/server');
const crypto = require('crypto');
const fs = require('fs');

// Generate a random symmetric key to encrypt the document
const symKey = crypto.randomBytes(32);

exports.handler = async (event, context, callback) => {
    console.log("Event: ", JSON.stringify(event));
/*
    let credential;
    try {
        credential = new PublicKeyCredential({
            id: credentialIdFromWebAuthn,
            rawId: new Uint8Array(credentialIdFromWebAuthn),
            response: {
                authenticatorData: new Uint8Array(authenticatorDataBytes),
                clientDataJSON: new Uint8Array(clientDataJSONBytes),
                signature: new Uint8Array(signatureBytes),
                userHandle: new Uint8Array(userHandleBytes),
            },
            type: 'public-key',
        });
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
    
    console.log('Credential:', credential);
    
    const cryptoKeyPair = await window.crypto.subtle.generateKey(
        {
            name: 'ECDSA',
            namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify'],
    );
    console.log('CryptoKeyPair:', cryptoKeyPair);
    
    const signature2 = await window.crypto.subtle.sign(
        {
            name: 'ECDSA',
            hash: { name: 'SHA-256' },
        },
        cryptoKeyPair.privateKey,
        new TextEncoder().encode(documentToSign),
    );
    console.log('Signature:', base64url.encode(signature2));*/

};



