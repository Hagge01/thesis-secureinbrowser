const { generateRegistrationOptions, generateAuthenticationOptions } = require('@simplewebauthn/server');

const rpName = 'SimpleWebAuthn Example';
const rpID = 'thesis-secureinbrowser.s3.eu-north-1.amazonaws.com'

exports.handler = async (event, context, callback) => {
  event.response.publicChallengeParameters = {};
  event.response.privateChallengeParameters = {};
  let userAuthenticators = [];

  
  if (event.request.userAttributes['custom:authCreds']) {
    console.log("User has authenticators");
    try {
    let cognitoAuthenticatorCreds = JSON.parse(event.request.userAttributes['custom:authCreds']);
    userAuthenticators = cognitoAuthenticatorCreds.map((authenticator) => ({
      credentialID: Buffer.from(authenticator.credentialID),
      credentialPublicKey: Buffer.from(authenticator.credentialPublicKey),
      counter: authenticator.counter,
      transports: ['internal', 'hybrid'],
    }));
    console.log("UserAuth: ", JSON.stringify(userAuthenticators));
    } catch (e) {
      console.log("Error: ", e);
      return callback(e);
    }
    let options;
    try {
      options = generateAuthenticationOptions({
        timeout: 60000,
        allowCredentials: userAuthenticators.map((authenticator) => ({
          id: authenticator.credentialID,
          type: 'public-key',
          transports: ['internal', 'hybrid'],
        })),
        userVerification: 'preferred',
      });
      console.log("UserAuth: ", JSON.stringify(options));
    } catch (e) {
        console.log("Error: ", e);
        return callback(null, e);
    }
    console.log("response public", JSON.stringify(event.response.publicChallengeParameters.assertionChallenge));
    event.response.publicChallengeParameters.assertionChallenge = JSON.stringify(options);
    event.response.privateChallengeParameters.assertionChallenge = options.challenge;

  }

  const options = generateRegistrationOptions({
    rpName,
    rpID,
    userID: event.request.userAttributes.email,
    userName: event.request.userAttributes.email,
    timeout: 60000,
    attestationType: 'indirect',
    authenticatorSelection: {
      userVerification: 'preferred',
      requireResidentKey: false,
    },
    supportedAlgorithmIDs: [-7, -257],
    excludeCredentials: userAuthenticators.map((authenticator) => ({
      id: authenticator.credentialID,
      type: 'public-key',
      transports: ['usb', 'ble', 'nfc', 'internal'],
    })),
  });
  console.log("option: ", JSON.stringify(options));
  

  event.response.publicChallengeParameters.attestationChallenge = JSON.stringify(options);
  event.response.privateChallengeParameters.attestationChallenge = options.challenge;

  callback(null, event);
};
