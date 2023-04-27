const SimpleWebAuthn = require('@simplewebauthn/server');
const crypto = require('crypto');
const fs = require('fs');

// Generate a random symmetric key to encrypt the document
const symKey = crypto.randomBytes(32);

exports.handler = async (event, context, callback) => {
    try {
        const path = event.path; // Convert path to lowercase for case-insensitive comparison
        const functionName = path.substring(path.lastIndexOf('/') + 1); // Extract function name from the path

        if (functionName === 'myfunction') {
            return myfunction(event, context);
        } else if (functionName === 'myfunction2') {
            return myfunction2(event, context);
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Invalid function name" }),
            };
        }
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request" }),
        };
    }
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

const myfunction = async (event, context) => {
    console.log('myfunction called');
    console.log(event);
};



