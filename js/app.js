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

firebase.auth().onAuthStateChanged(function(user) {

    showUser();
});

function toggleLoading(inSelector, inShow) {
    if (inShow)
        $(inSelector).addClass("loader");

    else $(inSelector).removeClass("loader");
}

function showUser() {
    // Check whether the user is authenticated
    var user = firebase.auth().currentUser;
    if (user) {
        var playersRef = firebase.database().ref("users/" + user.uid);
        // users/uid

        playersRef.on("value", function(snapshot) {
            var u = snapshot.val();

            $(".user-info").html('<i class="fa fa-user" aria-hidden="true"></i> ' + user.email + " (" + u.point + "점)");
        });


        $(".user-info").show();
    }
}