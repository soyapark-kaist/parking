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

    var playersRef = firebase.database().ref('users/');
    // Attach an asynchronous callback to read the data at our posts reference
    playersRef.once("value").then(function(snapshot) {
        var users = snapshot.val();

        var cnt = 1;
        var tableRows = [];

        for (var u in users) {
            tableRows.push({ "email": users[u].email.substring(0, 4) + "**", "point": users[u].point });
        }

        tableRows = tableRows.sort(function(a, b) { return (a.point < b.point) ? 1 : ((b.point < a.point) ? -1 : 0); });

        for (var t in tableRows)
            appendRow(cnt++, tableRows[t].email, tableRows[t].point);

    });

    // var playersRef = firebase.database().ref('images/');
    // // Attach an asynchronous callback to read the data at our posts reference
    // playersRef.once("value").then(function(snapshot) {
    //     var imgs = snapshot.val();
    //     var locations = [];

    //     for (var o in imgs) {
    //         if (imgs[o].status != 2) continue;
    //         currentImg = o;

    //         locations.push({
    //             'lat': imgs[o].latitude,
    //             'lng': imgs[o].longitude,
    //             'text': imgs[o].text
    //         })
    //     }

    //     //markmap
    //     var markers = locations.map(function(location, i) {
    //         var image = {
    //             url: 'img/car.ico',
    //             scaledSize: new google.maps.Size(30, 30)
    //         };
    //         var marker = new google.maps.Marker({
    //             position: location,
    //             icon: image,
    //             text: location.text
    //         });

    //         marker.addListener('click', function(e) {
    //             infoWindow.open(map);
    //             infoWindow.setContent(this.text);
    //             infoWindow.setPosition(this.getPosition())
    //         });

    //         return marker;
    //     });

    //     for (var i = 0; i < markers.length; i++) {
    //         markers[i].setOptions({
    //             map: map,
    //             visible: true
    //         });
    //     }

    // });
}

function appendRow(inRanking, inEmail, inPts) {
    $('.building-list tbody').append(
        '<tr>\
            <td>#' + inRanking + '</td>\
            <td>' + inEmail + '</td>\
            <td>' + inPts + '</td>\
          </tr>'
    );
}