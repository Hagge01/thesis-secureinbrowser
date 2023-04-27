

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

                    const authenticatorDataBytes = asseResp.response.authenticatorData;
                    const clientDataJSONBytes = asseResp.response.clientDataJSON;
                    const signatureBytes = asseResp.response.signature;
                    const userHandleBytes = asseResp.response.userHandle;
                    const credentialIdFromWebAuthn =asseResp.id;
                    
                    console.log('Authenticator Data:', authenticatorDataBytes);
                    console.log('Client Data:', clientDataJSONBytes);
                    console.log('Signature:', signatureBytes);
                    console.log('User Handle:', userHandleBytes);
                    console.log('Credential ID:', credentialIdFromWebAuthn);

                } catch (error) {
                    elemError.innerText = error;
                    console.log(error);
                    throw new Error(error);
                }
            } catch (error) {
                elemError.innerText = error;
                throw new Error(error);
            }

            $ajax({
                url: '/api/authenticate',
                method: 'POST',
                data: {
                    assertion: asseResp.response,
                }
            }).then(function (response) {
                if (response.success) {
                    elemSuccess.innerHTML = `Authentication successful!`;
                } else {
                    elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
                        response,
                    )}</pre>`;
                }
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







