
import { Auth } from 'aws-amplify';

// Add an event listener to the sign-out button or link
document.getElementById('sign-out-button').addEventListener('click', () => {
  // Call the Auth.signOut() method to sign the user out
  Auth.signOut()
    .then(() => {
      // Redirect the user to a different page or display a message
      window.location.href = '/pages/sida2.html';
    })
    .catch((error) => {
      console.log('Error signing out:', error);
    });
});
