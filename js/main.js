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

var currentImg, currentImgUrl;
var questions = [];

$(function() {

    toggleLoading(".loading", true);
    var playersRef = firebase.database().ref('images/');
    // Attach an asynchronous callback to read the data at our posts reference
    playersRef.once("value").then(function(snapshot) {
        var imgs = snapshot.val();

        for (var o in imgs) { //date
            for (var c in imgs[o]) {
                if (imgs[o][c].status == 2 || imgs[o][c].status == -2) continue;


                questions.push({ id: o + "/" + c, data: imgs[o][c] });
            }

            //remember this index and resume with index+1
        }

        if (questions.length == 0) {
            alert("현재 겸증할 차량이 없습니다!");
            toggleLoading(".loading", false);
        }

        fetchQuestion();
    });
});

function fetchQuestion() {
    $(".wrong input").val("");
    var q = questions.shift();
    currentImg = q.id;
    var storageRef = storage.ref();
    var imgRef = storageRef.child(q.id);
    // call .then() on the promise returned to get the value
    imgRef.getDownloadURL().then(function(url) {

        currentImgUrl = url;
        $("#myimg").attr("src", currentImgUrl);

        if (q.data.status == -1) // this image just loaded
        //request to cloud vision.
            sendFileToCloudVision(currentImgUrl);
        else {
            //load text from db
            loadText(currentImg);
        }

        toggleLoading(".loading", false);
    });

}

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
function sendFileToCloudVision(inUrl) {
    $("#results").text("loading");
    //Prepare form data
    var formData = new FormData();
    // formData.append("file", fileToUpload);
    formData.append("url", inUrl);
    formData.append("language", "kor");
    formData.append("apikey", "aea9bfed2588957");
    formData.append("isOverlayRequired", true);

    //Send OCR Parsing request asynchronously
    jQuery.ajax({
        url: "https://api.ocr.space/parse/image",
        data: formData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(ocrParsedResult) {
            //Get the parsed results, exit code and error message and details
            var parsedResults = ocrParsedResult["ParsedResults"];
            var ocrExitCode = ocrParsedResult["OCRExitCode"];
            var isErroredOnProcessing = ocrParsedResult["IsErroredOnProcessing"];
            var errorMessage = ocrParsedResult["ErrorMessage"];
            var errorDetails = ocrParsedResult["ErrorDetails"];
            var processingTimeInMilliseconds = ocrParsedResult["ProcessingTimeInMilliseconds"];

            //If we have got parsed results, then loop over the results to do something
            if (parsedResults != null) {

                //Loop through the parsed results
                $.each(parsedResults, function(index, value) {
                    var exitCode = value["FileParseExitCode"];
                    var parsedText = value["ParsedText"];
                    var errorMessage = value["ParsedTextFileName"];
                    var errorDetails = value["ErrorDetails"];

                    var v_normal = /[^0-9가-힣]/g;
                    parsedText = parsedText.replace(v_normal, '');
                    console.log(parsedText);
                    $('#results').text(parsedText);

                    var textOverlay = value["TextOverlay"];
                    var pageText = '';
                    switch (+exitCode) {
                        case 1:
                            pageText = parsedText;
                            break;
                        case 0:
                        case -10:
                        case -20:
                        case -30:
                        case -99:
                        default:
                            pageText += "Error: " + errorMessage;
                            break;
                    }
                });
            }
        },
        fail: function(data) {

        }
    });
}

function verifyLogin() {
    // Check whether the user is authenticated
    var user = firebase.auth().currentUser;
    if (!user) {
        localStorage.setItem("callback", "./turker.html");
        window.location.replace("./login.html");
    }
}


function correctPlate() {
    verifyLogin();

    var pRef = firebase.database().ref("images/" + currentImg);

    pRef.once("value").then(function(snapshot) {
        pRef.update({
            "text": snapshot.val().text ? snapshot.val().text : $("#results").text(),
            "status": snapshot.val().status + 1,
            "time": new Date().toString()
        }, function(error) {
            if (error) {
                console.log(error);
            } else {
                debugger;
                incrementPoints(1);

                alert("다음 문제로 넘어갑니다");
                fetchQuestion();
                // go to next question. 
            }
        });
    })



    return false;
}


function updatePlate(inValue) {
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari && $("input[name='answer']:checked").length == 0) {
        alert("번호판의 값을 적어주세요");
        $("input[name='answer']").focus();
        // e.preventDefault();
        return false;
    }

    verifyLogin();

    var pRef = firebase.database().ref("images/" + currentImg);

    pRef.update({
        "status": 0,
        "text": inValue ? inValue : $(".wrong  input").val(),
        "time": new Date().toString()
    }, function(error) {
        if (error) {
            console.log(error);
        } else {
            debugger;
            incrementPoints(1);

            alert("다음 문제로 넘어갑니다");
            fetchQuestion();
            // go to next question. 
        }
    });

    return false;
}

function faultPlate() {
    var pRef = firebase.database().ref("images/" + currentImg);

    pRef.update({
        "status": -2,
    }, function(error) {
        if (error) {
            console.log(error);
        } else {
            debugger;
            incrementPoints(1);

            alert("다음 문제로 넘어갑니다");
            fetchQuestion();
            // go to next question. 
        }
    });

    return false;
}

/**
 * Displays the results if any.
 */
function loadText() {
    var pRef = firebase.database().ref("images/" + currentImg);

    pRef.once("value").then(function(snapshot) {
        $("#results").text(snapshot.val().text);
    })

    return false;
}