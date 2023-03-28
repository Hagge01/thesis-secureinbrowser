fetch('https://0gmpdmznid.execute-api.eu-north-1.amazonaws.com/default/THESIS-secureinbrowser')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));