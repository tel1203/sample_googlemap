window.addEventListener("load",function(eve){

    // Promiseは「依頼」して放置するための命令です
    // 下記の例だと、prepareGMap(), getGPSInfo() を依頼して、それが終わればthenの中を実行します
    // プログラムの処理はPromiseブロックを通過して継続実行します
    Promise.all([
        prepareGMap("viewGmap", [-6.211544, 106.845172]),
        getGPSInfo(),
    ])
    .then(
    function(results){
        viewGmap = results[0];
        curPosition = results[1];
        console.log("getGPSInfo(): ", curPosition);

        // 地図を表示してから、センターに移動
        setGMapLocation(viewGmap, curPosition);
    },
        function(error){
            console.log("makeGMap failure");
            return;
        }
    );
}, false);

function prepareGMap(htmlId, curPosition) {
    console.log("function prepareGMap():");

    return new Promise(function(resolve, reject){

        var mapDiv = document.getElementById(htmlId);
        var mapOptions = {
            center: new google.maps.LatLng(curPosition[0], curPosition[1]),
            zoom: 16,
//            mapTypeControl: false,
            disableDefaultUI: true,
//            navigationControl: false,
            zoomControl: true,
//            panControl: false,
//            scrollwheel: false,
            draggable: true,
            disableDoubleClickZoom: false
        };
        map = new google.maps.Map(mapDiv, mapOptions);

        // 地図のスタイル, Google Map Style Wizardでスタイル作成サイト見つかります
        var mapStyle =
            [
              {
                "featureType": "poi",
                "stylers": [
                  { "visibility": "off" }
                ]
              },{
                "featureType": "transit.station.airport",
                "stylers": [
                  { "visibility": "off" }
                ]
              },{
                "featureType": "landscape.natural",
                "stylers": [
                  { "visibility": "off" }
                ]
              },{
              }
            ];
        var mapStyle2 = [ // Another Map Style
            {
                featureType : "all",
                elementType : "all",
                stylers : [
                    { visibility : "on" },
                    { hue : "#131c1c" },
                    { saturation : "-50" },
                    { invert_lightness : !0 }
                ]
            },
            {
                featureType : "water",
                elementType : "all",
                stylers : [
                    { visibility : "on" },
                    { hue : "#005eff" },
                    { invert_lightness : !0 }
                ]
            },
            {
                featureType : "poi",
                stylers : [ { visibility : "off" } ]
            },
            {
                featureType : "transit",
                elementType : "all",
                stylers : [ { visibility : "off" } ]
            }
        ];
        //map.setOptions({styles: mapStyle});
        map.setOptions({styles: mapStyle2});

        resolve(map);
    });
}

function getGPSInfo() {
    return new Promise(function(resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var data = position.coords ;
                console.log("GPSdata:", data);

                var gpsData = [];
                gpsData['latitude']=data.latitude;
                gpsData['longitude']=data.longitude;
                gpsData['altitude']=data.altitude;
                gpsData['accuracy']=data.accuracy;
                gpsData['bearing']=data.heading; //0=北,90=東,180=南,270=西
                gpsData['speed']=data.speed;

                resolve(gpsData);
            }, function(error) {
                switch (error.code) {
                   case 1:
                       // 位置情報の利用が許可されていません
                       break;
                   case 2:
                       // デバイスの位置が判定できません
                       break;
                   case 3:
                       // タイムアウト
                       break;
                   default:
                       // APIが未対応
                }
                reject(error.code);
            });
        } else {
            reject();
        }
    });

};


var _gmap_circle;
function setGMapCurrentPositionMark(map, curPosition, timeout, flagMove) {
    if (timeout == null) { timeout = 4000 };

    try {
        var latitude = curPosition['latitude'];
        var longitude = curPosition['longitude'];
        var accuracy = curPosition['accuracy'];
    } catch(e) {
        console.log("ERROR: setMapPositionMark(): null");
        return(null)
    }

    // 現在位置にピンをたてる
    var currentPos = new google.maps.LatLng(latitude, longitude);
    var currentMarker = new google.maps.Marker({
        position: currentPos
    });

    _gmap_circle = new google.maps.Circle({
        map: map,
        center: currentPos,
        radius: accuracy, // 単位はメートル
        strokeColor: '#0088ff',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#0088ff',
        fillOpacity: 0.2
    });
    setTimeout(function() {
        if (_gmap_circle.getVisible() == true) {
          _gmap_circle.setVisible(false);
        } else {
          _gmap_circle.setVisible(true);
        }
    }, timeout);


    // 現在地にスクロールさせる
    if (flagMove == true) {
        map.panTo(currentPos);
    }
};


function setGMapLocation(gmap, curPosition) {
    var latitude = curPosition['latitude'];
    var longitude = curPosition['longitude'];
    var accuracy = curPosition['accuracy'];

    // 現在地にスクロールさせる
    var currentPos = new google.maps.LatLng(latitude, longitude);
    gmap.setCenter(currentPos);
};

// Google Mapを現在地に移動する
function setGMapCurrentLocation(gmap) {
    getCurrentPosition().then(function(curPosition) {
        console.log("setGMapCurrentLocation(): SETMAP CENTER");
        console.log(JSON.stringify(curPosition));

        google.maps.event.trigger(gmap, 'resize');
        setMapPosition(gmap, curPosition);
    });
}



