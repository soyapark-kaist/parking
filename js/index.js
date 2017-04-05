function createMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15
    });

    map.setCenter({
        lat: 36.371,
        lng: 127.3624
    });



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

        for (var t in tableRows) {
            appendRow(cnt++, tableRows[t].email, tableRows[t].point);
            if (cnt == 7) break;
        }

    });

    var playersRef = firebase.database().ref('images/');
    // Attach an asynchronous callback to read the data at our posts reference
    playersRef.once("value").then(function(snapshot) {
        var imgs = snapshot.val();
        var locationCnt = [0, 0, 0, 0, 0];

        for (var o in imgs) {
            for (var i in imgs[o]) {
                if (imgs[o][i].status != 2) continue;

                locationCnt[imgs[o][i].location]++;
            }
        }

        var locations = [
            { lat: 36.368443, lng: 127.361919 },
            { lat: 36.371354, lng: 127.358271 },
            { lat: 36.366761, lng: 127.357136 },
            { lat: 36.373427, lng: 127.359050 },
            { lat: 36.373452, lng: 127.365332 }
        ];

        for (var l in locationCnt) {
            var infoWindow = new google.maps.InfoWindow({
                map: map
            });
            infoWindow.setContent(locationCnt[l] + "대");
            infoWindow.setPosition(locations[l]);
        }


    });
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