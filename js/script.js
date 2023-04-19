const { browserSupportsWebauthn, startRegistration, startAuthentication } = SimpleWebAuthnBrowser;
const { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } = AmazonCognitoIdentity;
var poolData = {
    UserPoolId: 'eu-north-1_gFRRs0pAX',
    ClientId: '7r2bam11ounrq97okspbpjrtv0'
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


function signUpWithWebAuthN(){
    var username = document.getElementById("username2").value;
    var email = document.getElementById("email2").value;
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }));
    userPool.signUp(username, 'PassWord123!', attributeList, null, function(err, result){
    if (err) {
        console.log(err);
        return;
    }
    });



};


    document.querySelector('#Login').addEventListener('click', async () => {
        const elemSuccess = document.querySelector('#authSuccess');
        const elemError = document.querySelector('#authError');
        const elemDebug = document.querySelector('#authDebug');

        // Reset success/error messages
        elemSuccess.innerHTML = '';
        elemError.innerHTML = '';
        elemDebug.innerHTML = '';

        // Request the generated assertion options to begin webauthn authentication
        userPool = await getAmazonCognitoUserPool();
        var cognitoUser = new CognitoUser({
            Username: document.getElementById('authUsername').value,
            Pool: userPool,
        });
        cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
        cognitoUser.initiateAuth(new AuthenticationDetails({
            Username: cognitoUser.getUsername()
        }), {
            customChallenge: async function(challengeParameters) {

                let asseResp;
                try {
                    const opts = JSON.parse(challengeParameters.assertionChallenge);
                    printDebug(elemDebug, 'Authentication Options', JSON.stringify(opts, null, 2));
                    asseResp = await startAuthentication(opts);
                    printDebug(elemDebug, 'Authentication Response', JSON.stringify(asseResp, null, 2));
                } catch (error) {
                    elemError.innerText = error;
                    throw new Error(error);
                }

                // Send the authenticators response
                cognitoUser.sendCustomChallengeAnswer(JSON.stringify(asseResp), this);
            },
            onSuccess: function (result) {
                printDebug(elemDebug, 'Server Response', JSON.stringify(result, null, 2));
                elemSuccess.innerHTML = `User authenticated!`;
            },
            onFailure: function (error) {
                elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
                    error,
                )}</pre>`;
            }
        });
    });





