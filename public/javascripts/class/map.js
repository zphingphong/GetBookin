/**
 * Map singleton object
 */

function Map(){
    this.geocoder = new google.maps.Geocoder();
    this.mapLoaded = false;
};

Map.prototype.initialize = function(config) {
    if(!config){
        console.error('Cannot initialize map: Missing configuration parameter')
        return;
    }
    var locations = config.locations ? config.locations : [];
    var mapPlaceHolder = document.getElementById(config.mapPlaceholderId);
    var centerLat = config.center[0];
    var centerLong = config.center[1];

    var mapOptions = {
        center: new google.maps.LatLng(centerLat, centerLong),
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.locationSelectionMap = new google.maps.Map(mapPlaceHolder, mapOptions);
    this.getLocationSelectionMarkers(locations);
    this.mapLoaded = true;
};

Map.prototype.getLocationSelectionMarkers = function(locations) {
    var thisScope = this;
    $.each(locations, function(index, location){
        new google.maps.Marker({
            map: thisScope.locationSelectionMap,
            position: new google.maps.LatLng(location.geolocation.latitude, location.geolocation.longitude),
            title: location.name
        });
    });
};

