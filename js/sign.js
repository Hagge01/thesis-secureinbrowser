

document.getElementById('signUser').addEventListener('click', async () => {
    userPool = await getAmazonCognitoUserPool();
    var cognitoUser= userPool.getCurrentUser();

    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
    cognitoUser.initiateAuth(new AuthenticationDetails({
        Username: cognitoUser.getUsername()
    }), {
        customChallenge: async function(challengeParameters) {
            let asseResp;
            try {
                const opts = JSON.parse(challengeParameters.assertionChallenge);
                console.log('opts', opts);
                try {

                    asseResp = await startAuthentication(opts);

                    console.log(asseResp);

                } catch (error) {
                    elemError.innerText = error;
                    console.log(error);
                    throw new Error(error);
                }
            } catch (error) {
                elemError.innerText = error;
                throw new Error(error);
            }

        }
    }, {
        onSuccess: function (result) {

        }

});
});

async function startAuthentication2(opts) {
    // Make the WebAuthn request to the authenticator
    const assertion = await navigator.credentials.get({
        publicKey: {
            challenge: stringToBuffer(opts.challenge),
            allowCredentials: opts.allowCredentials.map((cred) => {
                return {
                    id: base64UrlToBuffer(cred.id),
                    type: 'public-key',
                };
            }),
        },
    });

    // Extract the private key from the credential
    const privateKey = await crypto.subtle.importKey(
        'raw',
        assertion.response.clientExtensionResults.privateKey,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        true,
        ['sign'],
    );

    // Use the private key for encryption and decryption
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const plaintext = stringToBuffer('Hello, world!');
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv: iv,
        },
        privateKey,
        plaintext,
    );
    console.log(bufferToBase64Url(ciphertext));
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





