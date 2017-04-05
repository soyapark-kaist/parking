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
var map;

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

function incrementPoints(inPts) {
    var databaseRef = firebase.database().ref('users').child(firebase.auth().currentUser.uid).child('point');

    databaseRef.transaction(function(searches) {
        return (searches || 0) + inPts;
    });

}



function drawStreetLine() {
    var flightPlanCoordinates = [
        [
            { lat: 36.365929, lng: 127.363673 },
            { lat: 36.369617, lng: 127.361044 },
            { lat: 36.370801, lng: 127.359596 }
        ],
        [
            { lat: 36.370921, lng: 127.359349 },
            { lat: 36.371500, lng: 127.357911 },
            { lat: 36.372113, lng: 127.356645 }
        ],
        [
            { lat: 36.369653, lng: 127.355298 },
            { lat: 36.364357, lng: 127.358710 }
        ],
        [
            { lat: 36.373454, lng: 127.356490 },
            { lat: 36.373445, lng: 127.361994 }
        ],
        [
            { lat: 36.373410, lng: 127.366897 },
            { lat: 36.373436, lng: 127.365374 },
            { lat: 36.372581, lng: 127.364301 }
        ]
    ];

    var colors = ['#FF0000', "#FFA84D", "#1496CC", "#19FF36", "#7D3AB2"]
    for (var f in flightPlanCoordinates) {
        var flightPath = new google.maps.Polyline({
            path: flightPlanCoordinates[f],
            geodesic: true,
            strokeColor: colors[f],
            strokeOpacity: 1.0,
            strokeWeight: 3
        });

        flightPath.setMap(map);
    }
}