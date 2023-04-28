const SimpleWebAuthn = require('@simplewebauthn/server');
const crypto = require('crypto');
const fs = require('fs');

// Generate a random symmetric key to encrypt the document
const symKey = crypto.randomBytes(32);

exports.handler = async (event, context) => {
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
};


const myfunction = async (event, context) => {
    try {
        const requestBody = JSON.parse(event.body);
        console.log('Data received:', requestBody);

        // Your function code here

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" }),
        };
    } catch (error) {
        console.error("Error: ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process request" }),
        };
    }
};

const myfunction2 = async (event, context) => {
    const key4 = event.key4;
    const key5 = event.key5;
    const key6 = event.key6;

    console.log("Key4: ", key4);
    console.log("Key5: ", key5);
    console.log("Key6: ", key6);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Keys successfully accessed in myFunction2 YESSIR!" }, key4, key5, key6),
    };
};

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





