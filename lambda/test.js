function myFunction(event, context, callback) {
    console.log("Hello World");
    callback(null, "Success");
  }
  
  module.exports = {
    myFunction: myFunction
  };