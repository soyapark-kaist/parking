var center;
var markers;

function createMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15
    });

    map.setCenter({
        lat: 36.371,
        lng: 127.3624
    });

    var infoWindow = new google.maps.InfoWindow({
        map: map
    });
    infoWindow.close();

    drawStreetLine();

    var locations = [
        { lat: 36.368443, lng: 127.361919 },
        { lat: 36.371354, lng: 127.358271 },
        { lat: 36.366761, lng: 127.357136 },
        { lat: 36.373427, lng: 127.359050 },
        { lat: 36.373452, lng: 127.365332 }
    ];
    var streetName = ['중앙로', '노천극장', '엔드리스로드', '북측 기숙사 앞', '후문'];

    function nextChar(c) {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }

    var alphabet = 'A';

    //markmap
    markers = locations.map(function(location, i) {
        var marker = new google.maps.Marker({
            position: location,
            label: alphabet
        });

        appendRow(alphabet, streetName[i], i);

        alphabet = nextChar(alphabet);

        return marker;
    });

    for (var i = 0; i < markers.length; i++) {
        markers[i].setOptions({
            map: map,
            visible: true
        });
    }
}

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


        return false;
    }

    var fileArray = [];

    function storePicture(file, inIndex, inLength) {
        if (inIndex == inLength) {
            logPicture(fileArray[0].id, 0, fileArray.length);
            return;
        }

        incrementPoints(2);

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
            "location": $('.building-list tr.warning').attr("street"),
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

function appendRow(inID, inStreet, cnt) {
    $('.building-list tbody').append(
        '<tr street=' + cnt + '>\
            <td>#' + inID + '</td>\
            <td>' + inStreet + '</td>\
            <td><button class="btn btn-default" onclick="animateMarker(' + (cnt) + ')">선택</button></td> \
          </tr>'
    );
}

var preIndex = -1;

function animateMarker(index) {
    if (preIndex != -1) {
        markers[preIndex].setAnimation(null);
        $(".building-list tr button").eq(preIndex).text("선택");
    }


    $(".building-list tr").removeClass("warning");
    $(".building-list tr").eq(index).addClass("warning");
    $(".building-list tr button").eq(index).text("선택됨");

    preIndex = index;

    if (markers[index].getAnimation() != google.maps.Animation.BOUNCE) {
        markers[index].setAnimation(google.maps.Animation.BOUNCE);
    } else {
        markers[index].setAnimation(null);
    }
}