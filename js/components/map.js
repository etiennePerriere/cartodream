// Global map instance (kept for compatibility)
var map;
var markers = L.markerClusterGroup();
var routeLayers = new Array();

var MapComponent = {
    initialize: function() {
        // Initialize the map using config
        map = mapConfig.initializeMap();
        
        // Setup communes layer
        var bat = L.geoJson(
            communes,
            { style: mapConfig.styles.communes }
        ).addTo(map);
        routeLayers["bat"] = bat;

        // Initialize sentiers
        var sentiers_pdipr = L.geoJson(
            sentiersPDIPR,
            { style: mapConfig.styles.trails }
        );

        // Setup resize handling
        this.setupResizeHandlers();
    },

    setupResizeHandlers: function() {
        function resize() {
            $('#mymap').css("height", ($(window).height() - $('header').height()));
            map.invalidateSize();
        }
        resize();
        $(window).on("resize", resize);
    },

    displayRouteLayer: function(routeLayerId) {
        var isChecked = document.getElementById(routeLayerId).checked;
        if ((isChecked == true) && (!map.hasLayer(routeLayers[routeLayerId]))) {
            routeLayers[routeLayerId];
        } else {
            if ((isChecked == false) && (map.hasLayer(routeLayers[routeLayerId]))) {
                map.removeLayer(routeLayers[routeLayerId]);
            }
        }
    },

    createMarker: function(feature, latlng) {
        if (((feature.properties.sous_cat) != null) && ((feature.properties.sous_cat) != "")) {
            return new L.Marker(latlng, {
                icon: mapConfig.createIcon(feature.properties.etape),
                title: feature.properties.nom
            });
        }
    }
};

// Export for global use
window.MapComponent = MapComponent;
window.displayRouteLayer = MapComponent.displayRouteLayer;