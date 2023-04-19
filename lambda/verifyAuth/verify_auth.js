
var cognito = new CognitoIdentityServiceProvider();

// ORIGIN_DOMAIN_NAME should be populated with the CloudFront domain that was generated
const rpID = process.env.ORIGIN_DOMAIN_NAME || '';

const test = "HLELELELELE";
// The URL at which attestations and assertions should occur
const origin = `https://${rpID}`;

exports.handler = async function(event, context, callback) {
    let eventResponse = {
        answerCorrect: false
    };

    // Initialize MetadataService
    await MetadataService.initialize({
        verificationMode: 'permissive',
    });

    // Parse the list of stored authenticators from the Cognito user
    let cognitoAuthenticatorCreds = JSON.parse(event.request.userAttributes['custom:authCreds'] || '[]');
    let userAuthenticators = cognitoAuthenticatorCreds.map(authenticator => ({
        credentialID: Buffer.from(authenticator.credentialID),
        credentialPublicKey: Buffer.from(authenticator.credentialPublicKey),
        counter: authenticator.counter,
        transports: authenticator.transports || [],
    }));

    // Determine whether the challenge answer is an assertion (authentication) or an attestation (registration)
    let challengeAnswer = JSON.parse(event.request.challengeAnswer);
    if (challengeAnswer.response.authenticatorData) {

        // Using the "rawId" from the authenticator's assertion (challengeAnswer) compare with stored authenticator's credentialIDs to find the correct authenticator for verification
        let authenticator = userAuthenticators.find(({credentialID}) => (Buffer.compare(credentialID, base64url.toBuffer(challengeAnswer.rawId)) === 0)) || userAuthenticators[0];

        let verification = await verifyAuthenticationResponse({
            credential: challengeAnswer,
            expectedChallenge: event.request.privateChallengeParameters.assertionChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator,
        });

        // Pass?
        if (verification.verified) {
            const {authenticationInfo} = verification;

            const {newCounter} = authenticationInfo;
            authenticator.counter = newCounter;

            // Update the counter for the stored authenticator
            try {
                await cognito.adminUpdateUserAttributes({
                    UserAttributes: [
                        {
                            Name: 'custom:authCreds',
                            // Merges/replaces the current authenticator with its updated counter into the stored list of authenticators
                            Value: JSON.stringify(userAuthenticators.map(authenticator => [authenticator].find(updatedAuthenticator => (Buffer.compare(updatedAuthenticator.credentialID, authenticator.credentialID)) === 0) || authenticator)),
                        }
                    ],
                    UserPoolId: event.userPoolId,
                    Username: event.request.userAttributes.email,
                }).promise();
                eventResponse.answerCorrect = true;

            } catch (error) {
                console.error(error);
                eventResponse.answerCorrect = false;
                callback(null, eventResponse);
            }
        } else {
            eventResponse.answerCorrect = false;
            callback(null, eventResponse);
        }

    } else {
        let verification = await verifyRegistrationResponse({
            credential: challengeAnswer,
            expectedChallenge: event.request.privateChallengeParameters.attestationChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        // Can register new authenticator?
        if(verification.verified) {
            const { attestationInfo } = verification;
            const { credentialPublicKey, credentialID } = attestationInfo;

            // Create a new authenticator object with the credentialPublicKey and credentialID
            const newAuthenticator = {
                credentialID: Buffer.from(credentialID),
                credentialPublicKey: Buffer.from(credentialPublicKey),
                counter: 0,
                transports: [],
            };

            // Add the new authenticator to the list of user authenticators
            userAuthenticators.push(newAuthenticator);

            // Update the user's Cognito attribute with the updated list of authenticators
            try {
                await cognito.adminUpdateUserAttributes({
                    UserAttributes: [
                        {
                            Name: 'custom:authCreds',
                            Value: JSON.stringify(userAuthenticators),
                        }
                    ],
                    UserPoolId: event.userPoolId,
                    Username: event.request.userAttributes.email,
                }).promise();
                eventResponse.answerCorrect = true;
            } catch (error) {
                console.error(error);
                eventResponse.answerCorrect = false;
                callback(null, eventResponse);
            }
        } else {
            eventResponse.answerCorrect = false;
            callback(null, eventResponse);
        }
    }

// Return the event response
    callback(null, eventResponse);
};

