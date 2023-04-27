function base64urlEncode(data) {
    const base64 = btoa(String.fromCharCode.apply(null, data));
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }
  
  function base64urlDecode(base64url) {
    base64url = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = 4 - (base64url.length % 4);
    if (padding === 4) {
      padding = 0;
    }
    const base64 = base64url + '='.repeat(padding);
    const data = atob(base64);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; ++i) {
      result[i] = data.charCodeAt(i);
    }
    return result;
  }
  

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

                    const authenticatorDataBytes = Base64urlEncode(asseResp.response.authenticatorData)
                    const clientDataJSONBytes = Base64urlEncode(asseResp.response.clientDataJSON)
                    const signatureBytes = Base64urlEncode(asseResp.response.signature)
                    const userHandleBytes = Base64urlEncode(asseResp.response.userHandle)
                    const credentialIdFromWebAuthn = Base64urlEncode(asseResp.id)
                    
                    console.log('Authenticator Data:', authenticatorDataBytes);
                    console.log('Client Data:', clientDataJSONBytes);
                    console.log('Signature:', signatureBytes);
                    console.log('User Handle:', userHandleBytes);
                    console.log('Credential ID:', credentialIdFromWebAuthn);
                    let credential;
                    try {
                        credential = new PublicKeyCredential({
                            id: credentialIdFromWebAuthn,
                            rawId: base64urlDecode(credentialIdFromWebAuthn),
                            response: {
                                authenticatorData: base64urlDecode(authenticatorDataBytes),
                                clientDataJSON: base64urlDecode(clientDataJSONBytes),
                                signature: base64urlDecode(signatureBytes),
                                userHandle: base64urlDecode(userHandleBytes),
                            },
                            type: 'public-key',
                        });
                    } catch (error) {
                        console.log(error);
                        throw new Error(error);
                        console.log('RIP');
                    }
                    console.log('Creds: ',credential);

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
                    console.log('Signature:', base64url.encode(signature2));

                                    /*const signedDocument = {
                    document: documentToSign,
                    signature: base64url.encode(signature),
                    publicKey: await window.crypto.subtle.exportKey('raw', cryptoKeyPair.publicKey)
                };
                console.log('Signed Document:', signedDocument);*/
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







