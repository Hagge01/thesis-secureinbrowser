

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
                    $.ajax({
                        url: 'https://8sehj03dh7.execute-api.eu-north-1.amazonaws.com/default/THESIS-secureinbrowser-documentSign/documentsign/myfunction',
                        type: 'POST',
                        data: JSON.stringify(asseResp),
                        contentType: 'application/json',
                        dataType: 'json',
                        success: function (result) {
                            console.log(result);
                            console.log('Success');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log('Error:', textStatus, errorThrown);
                        }
                    });


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







