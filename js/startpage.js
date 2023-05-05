// Retrieve credsString from local storage
const credsString = JSON.parse(localStorage.getItem("credsString"));
console.log('publika: ', credsString[0].credentialPublicKey.data.toString('utf8'));
