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
    var cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
    cognitoUser.initiateAuth(new AuthenticationDetails({
        Username: cognitoUser.getUsername(),
    }), {
        customChallenge: async function(challengeParameters) {

            let attResp;
            try {
              const opts = JSON.parse(challengeParameters.attestationChallenge);
              printDebug(elemDebug, 'Registration Options', JSON.stringify(opts, null, 2));
              attResp = await startRegistration(opts);
              printDebug(elemDebug, 'Registration Response', JSON.stringify(attResp, null, 2));
            } catch (error) {
              if (error.name === 'InvalidStateError') {
                elemError.innerText = 'Error: Authenticator was probably already registered by user';
              } else {
                elemError.innerText = error;
              }

              throw error;
            }

            // Send the authenticators response
            cognitoUser.sendCustomChallengeAnswer(JSON.stringify(attResp), this);
        },
        onSuccess: function (result) {
            console.log('access token + ' + result.getAccessToken().getJwtToken());
        }
    });
    



};



