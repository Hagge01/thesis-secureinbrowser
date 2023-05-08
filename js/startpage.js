

async function getCredentials() {
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
                        const userName = attributes.find(attr => attr.getName() === 'email');
                        if (authCreds) {
                            
                            credsString = JSON.parse(authCreds.getValue());
                            console.log('Auth credentials:', authCreds.getValue());
                            console.log('publika: ', credsString[0].credentialPublicKey.data.toString('utf8'));
                            document.getElementById("publicKey").innerHTML = '"' + credsString[0].credentialPublicKey.data.toString('utf8') + '"';
                        } else {
                            console.log('Auth credentials not found.');
                        }
                        if (userName) {
                            document.getElementById("username").innerHTML = '"' + userName.getValue() + '"';
                            console.log('Username:', userName.getValue());
                        }else {
                            console.log('Username not found.');
                        }
                        });
                    }
            });
            }

            

}
  
  getCredentials();
  
 
