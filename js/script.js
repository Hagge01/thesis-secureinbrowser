

import {AmazonCognitoIdentity} from 'amazon-cognito-identity-js';


const { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails, Auth } = AmazonCognitoIdentity;

const signOut = () => {
    // Set up the Cognito User Pool
    const userPool = new CognitoUserPool({
        UserPoolId: 'your_user_pool_id',
        ClientId: 'your_client_id'
    });

    // Get the current user
    const currentUser = userPool.getCurrentUser();

    if (currentUser) {
        currentUser.signOut();
        console.log('Cognito user signed out successfully.');
    } else {
        console.error('No user is currently signed in.');
    }
};