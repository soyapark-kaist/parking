// Set up Firebase Config
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAl0156r5WQzUBqxLnl1grNvWs-D6W629w",
    authDomain: "rally-parking.firebaseapp.com",
    databaseURL: "https://rally-parking.firebaseio.com",
    storageBucket: "rally-parking.appspot.com",
    messagingSenderId: "624113491462"
};

// Initilize Firebase App, get DB and Storage services
var app = firebase.initializeApp(config),
    database = app.database(),
    storage = app.storage();


function toggleLoading(inSelector) {
    $(inSelector).toggleClass("loader");
}