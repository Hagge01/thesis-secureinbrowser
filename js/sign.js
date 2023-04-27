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
    publicKey: await window.crypto.subtle.exportKey('raw', cryptoKeyPair.publicKey),
};