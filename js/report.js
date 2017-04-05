var center;

document.addEventListener('DOMContentLoaded', function() {
    // Check whether the user is authenticated
    firebase.auth().onAuthStateChanged(function(user) {
        debugger;
        if (user) {
            $("#footer").show();
            $("#login-btn").hide();
        } else {
            $("#footer").hide();
            $("#login-btn").show();
            localStorage.setItem("callback", "./report.html");
        }

    });

    var imagesList = document.getElementById('images'),
        textInput = document.getElementById('text'),
        sendButton = document.getElementById('send'),
        file = document.getElementById('file');

    // Handle file uploads to Storage
    function handleFileSelect(e) {
        toggleLoading(".loading", true);
        e.preventDefault();

        // Try HTML5 geolocation.
        if ("geolocation" in navigator) {
            // var location_timeout = setTimeout("alert('브라우저의 위치정보 수집이 불가합니다. 설정에서 승인 후 다시 시도해주세요.');", 10000);
            navigator.geolocation.getCurrentPosition(function(position) {
                    center = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    var files = e.target.files,
                        i, file;
                    for (i = 0; file = files[i]; i++) {
                        //Only pics
                        if (!file.type.match('image')) {
                            alert("이미지만 업로드할 수 있습니다!");
                            return;
                        }

                        fileArray.push({ "file": file, "id": generateFilename(5) });
                    }

                    storePicture(fileArray[0].file, 0, fileArray.length);

                },
                function() { //error callback
                    // clearTimeout(location_timeout);
                    $('#submitSection').text('disabled');
                    console.log("Error geolocation");
                    alert('브라우저의 위치정보 수집이 불가합니다. 설정에서 승인 후 다시 시도해주세요.');
                    // handleLocationError(true, infoWindow, map.getCenter());
                }, {
                    timeout: 10000
                });


        } else {
            // Browser doesn't support Geolocation
            console.log("Error geolocation; brower doesn't support");
            alert('브라우저의 위치정보 수집이 불가합니다. 다른 브라우저에서 다시 시도해주세요.');
            // handleLocationError(false, infoWindow, map.getCenter());
        }


        return false;
    }

    var fileArray = [];

    function storePicture(file, inIndex, inLength) {
        if (inIndex == inLength) {
            logPicture(fileArray[0].id, 0, fileArray.length);
            return;
        }

        incrementPoints(3);

        var metadata = {
            'contentType': file.type,
        };

        var uploadTask = storage.ref().child([new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()].join("-") + "/" + fileArray[inIndex].id).put(file, metadata);

        uploadTask.on('state_changed', null, function(error) {
            alert('Upload failed:', error)
            console.log('Upload failed:', error)
        }, function() {
            console.log("here");
            storePicture(++inIndex < inLength ? fileArray[inIndex].file : null, inIndex, inLength);
            // logPicture(fileName);
        }.bind(uploadTask));
    }

    function logPicture(inFilename, inIndex, inLength) {
        if (inIndex == inLength) {
            alert('Upload succeeded!');
            toggleLoading(".loading", false);

            return;
        }

        var pRef = firebase.database().ref("images/" + [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()].join("-") + "/" + inFilename);

        var datas = [];
        pRef.set({
            "latitude": center.lat,
            "longitude": center.lng,
            "status": -1,
            "text": "",
            "time": new Date().toString()
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                // when post to DB is successful 
                logPicture(++inIndex < inLength ? fileArray[inIndex].id : null, inIndex, inLength);
            }
        });

    }

    function generateFilename(inLength) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < inLength; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    if (window.File && window.FileList && window.FileReader)
        file.addEventListener('change', handleFileSelect, false);
    else alert("해당 브러우저에서 지원되지 않습니다");
});