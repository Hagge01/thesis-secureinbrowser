
const rpName = 'SimpleWebAuthn Example';
const rpID = 'thesis-secureinbrowser.s3.eu-north-1.amazonaws.com';

const { generateRegistrationOptions, generateAuthenticationOptions } = require('@simplewebauthn/server');
const base64url = require('base64url');

exports.handler = async (event, context, callback) => {
    event.response.publicChallengeParameters = {};
    event.response.privateChallengeParameters = {};
    let userAuthenticators = [];

    // Define AuthenticationExtensionsPRFValues dictionary
    if (event.request.userAttributes['custom:authCreds']) {
        let cognitoAuthenticatorCreds = JSON.parse(event.request.userAttributes['custom:authCreds']);
        for (let i = 0; i < cognitoAuthenticatorCreds.length; i++) {
            const authenticator = cognitoAuthenticatorCreds[i];
            const credentialID = base64url.toBuffer(authenticator.credentialID);
            const credentialPublicKey = base64url.toBuffer(authenticator.credentialPublicKey);
            const counter = authenticator.counter;
            const transports = ['internal', 'hybrid'];
            userAuthenticators.push({credentialID, credentialPublicKey, counter, transports});
        }
    }



    const AuthenticationExtensionsPRFValues = {
        first:new Uint8Array([1, 2, 3, 4]).buffer,
        second: new Uint8Array([1, 2, 3, 4]).buffer,
    };


    const credID = userAuthenticators[0]?.credentialID;
    const prfInput = AuthenticationExtensionsPRFValues.first;

    // Define AuthenticationExtensionsPRFInputs dictionary
    const AuthenticationExtensionsPRFInputs = {
        eval: AuthenticationExtensionsPRFValues,
        evalByCredential: {
            [credID]: prfInput
        }
    };

    // Define AuthenticationExtensionsClientInputs dictionary
    const AuthenticationExtensionsClientInputs = {
        prf: AuthenticationExtensionsPRFInputs
    };

    // Define AuthenticationExtensionsPRFOutputs dictionary
    const AuthenticationExtensionsPRFOutputs = {
        enabled: true,
        results: AuthenticationExtensionsPRFValues
    };

    // Define AuthenticationExtensionsClientOutputs dictionary
    const AuthenticationExtensionsClientOutputs = {
        prf: AuthenticationExtensionsPRFOutputs
    };
    let salt = new Uint8Array(new Array(32).fill(1));

    if (event.request.userAttributes['custom:authCreds']) {
        console.log('User has authenticators');

        const options = generateAuthenticationOptions({
            // Require users to use a previously-registered authenticator
            allowCredentials: userAuthenticators.map(authenticator => ({
                id: authenticator.credentialID,
                type: 'public-key',
                // Optional
                transports: authenticator.transports,
            })),
            userVerification: 'discouraged',
            extensions: {
                prf: {
                    eval: {
                        first: salt,
                    },
                },
            },
        });

        event.response.publicChallengeParameters.assertionChallenge = JSON.stringify(options);
        event.response.privateChallengeParameters.assertionChallenge = options.challenge;
        return callback(null, event);
    }

    const options = generateRegistrationOptions({
        rpName,
        rpID,
        userID: event.request.userAttributes.email,
        userName: event.request.userAttributes.email,
        attestationType: 'indirect',
        supportedAlgorithmIDs: [-7, -257],
        excludeCredentials: userAuthenticators.map((authenticator) => ({
            id: authenticator.credentialID,
            type: 'public-key',
            transports: ['internal', 'hybrid'],
        })),
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
        ],
        timeout: 60000,
        authenticatorSelection: {
            requireResidentKey: false,
            userVerification: 'discouraged',
        },
        extensions: {
            prf : {
                enabled: true,
            }},
    });
    //console.log("option: ", JSON.stringify(options));
    event.response.publicChallengeParameters.attestationChallenge = JSON.stringify(options);
    event.response.privateChallengeParameters.attestationChallenge = options.challenge;
    callback(null, event);
};
