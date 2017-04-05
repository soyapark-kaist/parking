// FirebaseUI config.
var uiConfig = {
    // Url to redirect to after a successful sign-in.
    'signInSuccessUrl': './index.html',
    'callbacks': {
        'signInSuccess': function(user, credential, redirectUrl) {
            if (window.opener) {
                // The widget has been opened in a popup, so close the window
                // and return false to not redirect the opener.
                window.close();
                return false;
            } else {
                var playersRef = firebase.database().ref("users/" + firebase.auth().currentUser.uid);
                // users/uid

                playersRef.once("value").then(function(snapshot) {
                    if (!snapshot.val()) {
                        playersRef.set({
                                "point": 0,
                                "email": firebase.auth().currentUser.email
                            },
                            function(error) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    // when post to DB is successful 
                                    window.location.replace(localStorage.getItem("callback"));
                                }

                            });
                    } else window.location.replace(localStorage.getItem("callback"));
                });



                // The widget has been used in redirect mode, so we redirect to the signInSuccessUrl.

            }
        }
    },
    'signInOptions': [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    'tosUrl': 'https://kixlab.org/rally2/privacy.html'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded to include the FirebaseUI sign-in widget
// within the element corresponding to the selector specified.
ui.start('#firebaseui-auth-container', uiConfig);

/*
$(function() {
    // var auth = app.auth();
    var user = firebase.auth().currentUser;

    var email = "soya@kaist.ac.kr"
    var password = "mypassword"

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        if (error.code == "auth/email-already-in-use")
            alert("인증된 메일입니다. 다음 화면으로 넘어갑니다")
    });

    firebase.auth().onAuthStateChanged(function(user) {

        if (user.emailVerified) {
            console.log('Email is verified');
        } else {
            console.log('Email is not verified');
            user.sendEmailVerification();
        }
    });

})
*/