const { generateRegistrationOptions, generateAuthenticationOptions } = require('@simplewebauthn/server');
const base64url = require("base64url");

const rpName = 'SimpleWebAuthn Example';
const rpID = 'thesis-secureinbrowser.s3.eu-north-1.amazonaws.com'

exports.handler = async (event, context, callback) => {
  event.response.publicChallengeParameters = {};
  event.response.privateChallengeParameters = {};
  let userAuthenticators = [];



  if (event.request.userAttributes['custom:authCreds']) {
    console.log("User has authenticators");

    const cognitoAuthenticatorCreds = JSON.parse(event.request.userAttributes['custom:authCreds']);

    //console.log("CognitoAuth: ", JSON.stringify(cognitoAuthenticatorCreds));

    for (let i = 0; i < cognitoAuthenticatorCreds.length; i++) {
      const authenticator = cognitoAuthenticatorCreds[i];
      const credentialID = Buffer.from(authenticator.credentialID);
      const credentialPublicKey = Buffer.from(authenticator.credentialPublicKey);
      const counter = authenticator.counter;
      const transports = ['internal', 'hybrid'];

      userAuthenticators.push({ credentialID, credentialPublicKey, counter, transports });
    }

    //console.log("UserAuth map: ", JSON.stringify(userAuthenticators));
    const options = generateAuthenticationOptions({
      // Require users to use a previously-registered authenticator
      allowCredentials: userAuthenticators.map(authenticator => ({
        id: authenticator.credentialID,
        type: 'public-key',
        // Optional
        transports: authenticator.transports,
      })),
      userVerification: 'preferred',
        extensions: {
            largeBlob: {
                read: true
            }
        },
    });
      //console.log("options Auth: ", JSON.stringify(options));

    event.response.publicChallengeParameters.assertionChallenge = JSON.stringify(options);
    event.response.privateChallengeParameters.assertionChallenge = options.challenge;
    return callback(null, event);
  }
  const encoder = new TextEncoder();
  const largeBlobData = encoder.encode("Your large blob data here");

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
            userVerification: 'preferred',
        },
      extensions: {
          largeBlob: {
              support: "required",
              write: largeBlobData
          }
      }
  });

  //console.log("option: ", JSON.stringify(options));
  

  event.response.publicChallengeParameters.attestationChallenge = JSON.stringify(options);
  event.response.privateChallengeParameters.attestationChallenge = options.challenge;

  callback(null, event);
};
