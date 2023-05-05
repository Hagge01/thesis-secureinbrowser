const getAmazonCognitoUserPool = require('./script.js');

userPool = await getAmazonCognitoUserPool();
var cognitoUser= userPool.getCurrentUser();

console.log(cognitoUser.getSignInUserSession());
                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    const authCreds = attributes.find(attr => attr.getName() === 'custom:authCreds');
                    if (authCreds) {
                    credsString = JSON.parse(authCreds.getValue());
                    console.log('Auth credentials:', authCreds.getValue());
                    console.log(credsString[0].credentialPublicKey);
                    } else {
                    console.log('Auth credentials not found.');
                    }

                });