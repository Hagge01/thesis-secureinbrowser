

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
                    const { response } = asseResp;
                    const { authenticatorData, clientDataJSON, signature, userHandle } = response;
                    
                    // Store the authenticator data, client data, signature, and user handle for later use

                    const authenticatorDataBytes = asseResp.response.authenticatorData
                    const clientDataJSONBytes = asseResp.response.clientDataJSON;
                    const signatureBytes = asseResp.response.signature
                    const userHandleBytes = asseResp.response.userHandle
                    
                    console.log('Authenticator Data:', authenticatorDataBytes);
                    console.log('Client Data:', clientDataJSONBytes);
                    console.log('Signature:', signatureBytes);
                    console.log('User Handle:', userHandleBytes);
                } catch (error) {
                    elemError.innerText = error;
                    console.log(error);
                    throw new Error(error);
                }
            } catch (error) {
                elemError.innerText = error;
                throw new Error(error);
            }

            return asseResp;
        }
    }, {
        onSuccess: function (result) {

        }

});
});







/*
const credential = new PublicKeyCredential({
    id: credentialIdFromWebAuthn,
    rawId: base64url.decode(credentialIdFromWebAuthn),
    response: {
        authenticatorData: base64url.decode(authenticatorDataFromWebAuthn),
        clientDataJSON: base64url.decode(clientDataJSONFromWebAuthn),
        signature: base64url.decode(signatureFromWebAuthn),
        userHandle: base64url.decode(userHandleFromWebAuthn),
    },
    type: 'public-key',
});

const cryptoKeyPair = await window.crypto.subtle.generateKey(
    {
        name: 'ECDSA',
        namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify'],
);

const signature = await window.crypto.subtle.sign(
    {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
    },
    cryptoKeyPair.privateKey,
    new TextEncoder().encode(documentToSign),
);

const signedDocument = {
    document: documentToSign,
    signature: base64url.encode(signature),
    publicKey: await window.crypto.subtle.exportKey('raw', cryptoKeyPair.publicKey)
};*/