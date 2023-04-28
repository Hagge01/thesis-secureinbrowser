const { createCredential } = require('@simplewebauthn/server');


const crypto = require('crypto');
const fs = require('fs');

// Generate a random symmetric key to encrypt the document
const symKey = crypto.randomBytes(32);

exports.handler = async (event, context) => {
    try {
        const path = event.path; // Convert path to lowercase for case-insensitive comparison
        const functionName = path.substring(path.lastIndexOf('/') + 1); // Extract function name from the path

        if (functionName === 'myfunction') {



            const data = event.body;
            console.log("Data: ", data);
            try{
                const body = JSON.parse(data);
                const credid = body.id;
                const credrawid = body.rawId;
                const authenticatorData = body.response.authenticatorData;
                const clientData = body.response.clientDataJSON;
                const signature = body.response.signature;
                const userHandle = body.response.userHandle;

                console.log("ID:", credid);
                console.log("RawID:", credrawid);
                console.log("AuthenticatorData:", authenticatorData);
                console.log("ClientData:", clientData);
                console.log("Signature:", signature);
                console.log("UserHandle:", userHandle);


            } catch (e) {
                console.log("Error:", e);

            }








            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Success" }),
            }
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


    /*
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
    

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" }),
        };

};


   




