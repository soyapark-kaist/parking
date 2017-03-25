// Copyright 2015, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var CV_URL = 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAl0156r5WQzUBqxLnl1grNvWs-D6W629w';

$(function() {
    var storageRef = storage.ref();

    var playersRef = firebase.database().ref('images/');
    // Attach an asynchronous callback to read the data at our posts reference
    playersRef.once("value").then(function(snapshot) {
        var imgs = snapshot.val();

        for (var o in imgs) {
            if (imgs[o].status == 2) continue;

            var imgRef = storageRef.child('images/' + o);
            // call .then() on the promise returned to get the value
            imgRef.getDownloadURL().then(function(url) {
                var pulledProfileImage = url;
                $("#myimg").attr("src", url);
            });

            if (imgs[o].status == 0)
                sendFileToCloudVision("gs://rally-parking.appspot.com/images/" + o);

            //remember this index and resume with index+1

            break;
        }
    });
});

/**
 * 'submit' event handler - reads the image bytes and sends it to the Cloud
 * Vision API.
 */
function uploadFiles(event) {
    event.preventDefault(); // Prevent the default form post

    // Grab the file and asynchronously convert to base64.
    // var file = $('#fileform [name=fileField]')[0].files[0];
    // var reader = new FileReader();
    // reader.onloadend = processFile;
    // reader.readAsDataURL(file);
    sendFileToCloudVision();

    return false;
}

/**
 * Sends the given file contents to the Cloud Vision API and outputs the
 * results.
 */
function sendFileToCloudVision() {
    var request = {
        requests: [{
            image: {
                source: {
                    // "gcsImageUri": inURL
                    "gcsImageUri": "gs://rally-parking.appspot.com/images/2017-3-25nVuBX"
                }
            },
            features: [{
                type: "TEXT_DETECTION",
                maxResults: 200
            }]
        }]
    };

    $('#results').text('Loading...');
    $.post({
        url: CV_URL,
        data: JSON.stringify(request),
        contentType: 'application/json'
    }).fail(function(jqXHR, textStatus, errorThrown) {
        $('#results').text('ERRORS: ' + textStatus + ' ' + errorThrown);
    }).done(displayJSON);
}

/**
 * Displays the results.
 */
function displayJSON(data) {
    var contents = data["responses"][0]["fullTextAnnotation"].text;
    $('#results').text(contents);
    var evt = new Event('results-displayed');
    evt.results = contents;
    document.dispatchEvent(evt);
}

function correctPlate() {
    var pRef = firebase.database().ref("images/" + inFilename);

    pRef.update({
        "time-line": {
            "submit": p["time-line"]["submit"],
            "sent": new Date().toString()
        }
    }, function(error) {
        if (error) {
            console.log(error);
        } else {
            alert("감사합니다!");
        }
    });
}

function updatePlate() {
    var pRef = firebase.database().ref("images/" + inFilename);

    // reset status to 0 & update with new answer
    pRef.update({
        "status": 0,
        "text": $(".wrong  input").val()
    }, function(error) {
        if (error) {
            console.log(error);
        } else {
            alert("감사합니다!");
            // go to next question. 
        }
    });

    return false;
}