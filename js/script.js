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



