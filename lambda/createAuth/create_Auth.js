const { generateRegistrationOptions, generateAuthenticationOptions } = require('@simplewebauthn/server');

const rpName = 'SimpleWebAuthn Example';
const rpID = process.env.ORIGIN_DOMAIN_NAME || '';

exports.handler = async (event, context, callback) => {
  event.response.publicChallengeParameters = {};
  event.response.privateChallengeParameters = {};
  let userAuthenticators = [];

  if (event.request.userAttributes['custom:authCreds']) {
    let cognitoAuthenticatorCreds = JSON.parse(event.request.userAttributes['custom:authCreds']);
    userAuthenticators = cognitoAuthenticatorCreds.map((authenticator) => ({
      credentialID: Buffer.from(authenticator.credentialID),
      credentialPublicKey: Buffer.from(authenticator.credentialPublicKey),
      counter: authenticator.counter,
      transports: authenticator.transports || [],
    }));

    const options = generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials: userAuthenticators.map((authenticator) => ({
        id: authenticator.credentialID,
        type: 'public-key',
        transports: authenticator.transports ?? ['usb', 'ble', 'nfc', 'internal'],
      })),
      userVerification: 'preferred',
    });

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

  event.response.publicChallengeParameters.attestationChallenge = JSON.stringify(options);
  event.response.privateChallengeParameters.attestationChallenge = options.challenge;

  callback(null, event);
};
