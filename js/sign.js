

document.getElementById('signUser').addEventListener('click', async () => {
    userPool = await getAmazonCognitoUserPool();
    var cognitoUser= userPool.getCurrentUser();

    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
    cognitoUser.initiateAuth(new AuthenticationDetails({
        Username: cognitoUser.getUsername()
    }), {
        customChallenge: async function(challengeParameters) {
            let asseResp;
            try {
                const opts = JSON.parse(challengeParameters.assertionChallenge);
                console.log('opts', opts);
                try {

                    asseResp = await startAuthentication(opts);

                    console.log(asseResp);

                } catch (error) {
                    elemError.innerText = error;
                    console.log(error);
                    throw new Error(error);
                }
            } catch (error) {
                elemError.innerText = error;
                throw new Error(error);
            }

        }
    }, {
        onSuccess: function (result) {

        }

});
});






