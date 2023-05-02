

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
                    // Generate a random key for encryption
                  const key = crypto.randomBytes(32).toString('hex');

                  // Encrypt data
                  const inputData = 'This is some test data';
                  const cipher = crypto.createCipher('aes-256-cbc', key);
                  const encryptedData = Buffer.concat([cipher.update(inputData), cipher.final()]);

                  console.log('Encrypted data:', encryptedData.toString('hex'));

                  // Decrypt data
                  const decipher = crypto.createDecipher('aes-256-cbc', key);
                  const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

                  console.log('Decrypted data:', decryptedData.toString());

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





