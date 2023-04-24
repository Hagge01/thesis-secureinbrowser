const AWS = require('aws-sdk');
const CognitoIdentityServiceProvider = AWS.CognitoIdentityServiceProvider;
const { verifyRegistrationResponse, verifyAuthenticationResponse, VerifiedRegistrationResponse, VerifiedAuthenticationResponse, MetadataService } = require('@simplewebauthn/server');

var cognito = new CognitoIdentityServiceProvider();

const rpID = 'thesis-secureinbrowser.s3.eu-north-1.amazonaws.com';
const origin = 'https://thesis-secureinbrowser.s3.eu-north-1.amazonaws.com';
// The URL at which attestations and assertions should occur

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
    console.log("UserAuth: ",JSON.stringify(userAuthenticators));
    console.log("Event", JSON.stringify(event));
    // Determine whether the challenge answer is an assertion (authentication) or an attestation (registration)
    let challengeAnswer = JSON.parse(event.request.challengeAnswer);
    console.log("ChallengeAnswer: ",JSON.stringify(challengeAnswer));
    if (challengeAnswer.response.authenticatorData) {

        // Using the "rawId" from the authenticator's assertion (challengeAnswer) compare with stored authenticator's credentialIDs to find the correct authenticator for verification
        let authenticator = userAuthenticators.find(({credentialID}) => (Buffer.compare(credentialID, base64url.toBuffer(challengeAnswer.rawId)) === 0)) || userAuthenticators[0];
try {let verification = await verifyAuthenticationResponse({
    response: challengeAnswer,
    expectedChallenge: event.request.privateChallengeParameters.assertionChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator,
});} catch (err) {console.log("Error: ",err);}
        

        // Pass?
        if (verification.verified) {
            const {authenticationInfo} = verification;

            const {newCounter} = authenticationInfo;
            authenticator.counter = newCounter;

            // Update the counter for the stored authenticator
            try {
                console.log("AdminUserCreateAttributesValue: ",JSON.stringify(userAuthenticators.map(authenticator => [authenticator].find(updatedAuthenticator => (Buffer.compare(updatedAuthenticator.credentialID, authenticator.credentialID)) === 0) || authenticator)));
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
        console.log("challengeAnswer.response.authenticatorData: ",JSON.stringify(challengeAnswer.response.authenticatorData));
    } else {
        let verification = await verifyRegistrationResponse({
            response: challengeAnswer,
            expectedChallenge: event.request.privateChallengeParameters.attestationChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        console.log("Verification: ",JSON.stringify(verification));
       
        // Can register new authenticator?
        if(verification.verified) {
            let attestationInfo = verification;
            console.log("attestationInfo: ",JSON.stringify(attestationInfo));
            let credentialPublicKey = JSON.stringify(attestationInfo.credentialPublicKey);
            let credentialID = JSON.stringify(attestationInfo.credentialID);
            
            console.log("CredentialPublicKey: ",JSON.stringify(credentialPublicKey));
            console.log("CredentialID: ",JSON.stringify(credentialID));
            

            // Create a new authenticator object with the credentialPublicKey and credentialID
            const newAuthenticator = {
                credentialID: credentialID,
                credentialPublicKey: credentialPublicKey,
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

