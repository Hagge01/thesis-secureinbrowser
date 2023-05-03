
        /**
         * A simple way to control how debug content is writteddn to a debug console element
         */
        function printDebug(elemDebug, title, output) {
            if (elemDebug.innerHTML !== '') {
                elemDebug.innerHTML += '\n';
            }
            elemDebug.innerHTML += `// ${title}\n`;
            elemDebug.innerHTML += `${output}\n`;
        }

    let userPool;
      function getAmazonCognitoUserPool() {

        // We only need to create this object once, so let's only do so if we haven't already

          // A neat trick, we can determine the dynamically generated UserPoolId and ClientId from this page's headers (S3 Object Metadata)
          var poolData = {
              UserPoolId: 'eu-north-1_Mili80FJ6',
              ClientId: '4iq2f333ajd9ne279uqj6oqvs3'
          };

          userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

        return userPool;
      }
        function signOut() {
            userPool = getAmazonCognitoUserPool();
            var cognitoUser = userPool.getCurrentUser();

            if (cognitoUser) {
                cognitoUser.signOut();
                console.log('User signed out');
            }
        }

        function isSignedIn(){
            userPool = getAmazonCognitoUserPool();
            var cognitoUser = userPool.getCurrentUser();
            if (cognitoUser != null) {
                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        window.location.href = "../pages/index.html";
                    } else {
                        console.log("User is logged in.");
                        console.log("public key: ", attResp);
                    }
                });
            } else {
                window.location.href = "../pages/index.html";
            }
        }

const { browserSupportsWebauthn, startRegistration, startAuthentication } = SimpleWebAuthnBrowser;
const { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } = AmazonCognitoIdentity;

        document.getElementById('register-btn').addEventListener('click', async () => {
            const elemSuccess = document.querySelector('#regSuccess');
            const elemError = document.querySelector('#regError');
            const elemDebug = document.querySelector('#regDebug');


            // Reset success/error messages
            elemSuccess.innerHTML = '';
            elemError.innerHTML = '';
            elemDebug.innerHTML = '';

            const loadingBar = document.querySelector('#loading-bar');

            // Register the user in Cognito
            userPool = await getAmazonCognitoUserPool();
            userPool.signUp(document.getElementById('email2').value, 'PasswordD123!', [new CognitoUserAttribute({
                Name: 'email',
                Value: document.getElementById('email2').value
            })], null, function (error, result) {

                // We want to allow users to register multiple authenticators to a single user account, so if the Cognito "signUp" fails with user exists, that's okay, ignore it
                if (!error || error.code == "UsernameExistsException") {

                    // Request the generated attestation options to begin webauthn enrollment
                    var cognitoUser = new CognitoUser({
                        Username: document.getElementById('email2').value,
                        Pool: userPool,
                    });
                    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
                    cognitoUser.initiateAuth(new AuthenticationDetails({
                        Username: cognitoUser.getUsername(),
                    }), {
                        customChallenge: async function(challengeParameters) {
                            let attResp;
                            try {
                                loadingBar.style.width = '10%'; // update the width to 25%
                                const opts = JSON.parse(challengeParameters.attestationChallenge);
                                loadingBar.style.width = '25%'; // update the width to 25%
                                printDebug(elemDebug, 'Registration Options', JSON.stringify(opts, null, 2));
                                attResp = await startRegistration(opts);
                                console.log(attResp);
                                loadingBar.style.width = '40%'; // update the width to 25%
                                printDebug(elemDebug, 'Registration Response', JSON.stringify(attResp, null, 2));
                            } catch (error) {
                                if (error.name === 'InvalidStateError') {
                                    elemError.innerText = 'Error: Authenticator was probably already registered by user';
                                } else {
                                    elemError.innerText = error;
                                }

                                console.log('Error in try block:', error); // Add a console.log statement here

                                throw error;
                            }

                            // Send the authenticators response
                            loadingBar.style.width = '60%'; // update the width to 25%
                            cognitoUser.sendCustomChallengeAnswer(JSON.stringify(attResp), this);
                            loadingBar.style.width = '90%'; // update the width to 25%

                        },
                        onSuccess: function (result) {
                            loadingBar.style.width = '100%'; // update the width to 25%
                            printDebug(elemDebug, 'Server Response', JSON.stringify(result, null, 2));
                            elemSuccess.innerHTML = `Authenticator registered!`;
                            
                        },
                        onFailure: function (error) {
                            elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
                                error,
                            )}</pre>`;
                        }
                    });
                } else {
                    elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
                        error,
                    )}</pre>`;
                }
            });
        });

     /**
         * Authentication
         */
         document.getElementById('authUsername').addEventListener('click', async () => {
          const elemSuccess = document.querySelector('#authSuccess');
          const elemError = document.querySelector('#authError');
          const elemDebug = document.querySelector('#authDebug');

          // Reset success/error messages
          elemSuccess.innerHTML = '';
          elemError.innerHTML = '';
          elemDebug.innerHTML = '';

             const loadingBar = document.querySelector('#loading-bar');

          // Request the generated assertion options to begin webauthn authentication
          userPool = await getAmazonCognitoUserPool();
          var cognitoUser = new CognitoUser({
            Username: document.getElementById('email2').value,
	          Pool: userPool,
          });
          cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
          cognitoUser.initiateAuth(new AuthenticationDetails({
              Username: cognitoUser.getUsername()
            }), {
              customChallenge: async function(challengeParameters) {

                let asseResp;
                try {
                    loadingBar.style.width = '10%'; // update the width to 25%
                  const opts = JSON.parse(challengeParameters.assertionChallenge);
                  console.log('opts', opts);
                  printDebug(elemDebug, 'Authentication Options', JSON.stringify(opts, null, 2));
                    try {
                        loadingBar.style.width = '25%';
                        asseResp = await startAuthentication(opts);
                        loadingBar.style.width = '40%';
                        printDebug(elemDebug, 'Authentication Response', JSON.stringify(asseResp, null, 2));
                    } catch (error) {
                        elemError.innerText = error;
                        console.log(error);
                        throw new Error(error);
                    }
                  printDebug(elemDebug, 'Authentication Response', JSON.stringify(asseResp, null, 2));
                } catch (error) {
                  elemError.innerText = error;
                  throw new Error(error);
                }
                  loadingBar.style.width = '60%';
                  // Send the authenticators response
                cognitoUser.sendCustomChallengeAnswer(JSON.stringify(asseResp), this);
                  loadingBar.style.width = '80%';
              },
              onSuccess: function (result) {
                  loadingBar.style.width = '100%';
                  printDebug(elemDebug, 'Server Response', JSON.stringify(result, null, 2));
                elemSuccess.innerHTML = `User authenticated!`;
                window.location.href = "../pages/auth.html";
              },
              onFailure: function (error) {
                elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
                  error,
                )}</pre>`;
              }
          });
        });



        var publicKey = {
            // Here are the extensions (as "inputs")
            extensions: {
                largeBlob: {
                    support: "required",
                },
            },
            authenticatorSelection: {
                requireResidentKey: true,
            },
            challenge: new Uint8Array(16) /* from the server */,
            rp: {
                name: "Example CORP",
                id: "localhost"
            },
            user: {
                id: new Uint8Array(16) /* from the server */,
                name: "jdoe@example.com",
                displayName: "John Doe"
            },
            pubKeyCredParams: [
                {
                    type: "public-key",
                    alg: -7
                }
            ]
        };
        function auth() {
            navigator.credentials.create({ publicKey })
                .then(function (newCredentialInfo) {
                    var myBuffer = newCredentialInfo.getClientExtensionResults();
                    console.log(myBuffer);
                    // myBuffer will contain the result of any of the processing of the "loc" and "uvi" extensions
                }).catch(function (err) {
                console.error(err);
            });
        }
      
        function isSignedIn(){
            userPool = getAmazonCognitoUserPool();
            var cognitoUser = userPool.getCurrentUser();
            if (cognitoUser != null) {
                cognitoUser.getSession(function(err, session) {
                    if (err) {
                        window.location.href = "../pages/index.html";
                    } else {
                        console.log("User is logged in.");
                        console.log("attresp", attResp);
                        console.log("asseresp", asseResp);
                    }
                });
            } else {
                window.location.href = "../pages/index.html";
            }
        }