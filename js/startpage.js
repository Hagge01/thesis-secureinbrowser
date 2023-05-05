isSignedIn();

async function myAsyncFunction() {
    userPool = getAmazonCognitoUserPool();
            var cognitoUser = userPool.getCurrentUser();
            if (cognitoUser != null) {
                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        window.location.href = "../pages/index.html";
                    } else {
                        cognitoUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                
                        const authCreds = attributes.find(attr => attr.getName() === 'custom:authCreds');
                        if (authCreds) {
                            credsString = JSON.parse(authCreds.getValue());
                            console.log('Auth credentials:', authCreds.getValue());
                            console.log('publika: ', credsString[0].credentialPublicKey.data.toString('utf8'));
                        } else {
                            console.log('Auth credentials not found.');
                        }
                        });
                    }
            });
            }
}
  
  myAsyncFunction();
  