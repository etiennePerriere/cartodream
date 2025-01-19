// Map configuration and helper functions
var mapConfig = {
    initializeMap: function() {
        var point = new L.LatLng(siteConfig.map.center.lat, siteConfig.map.center.lng);
        
        // Map options
        var mapOptions = {
            center: point,
            zoom: siteConfig.map.defaultZoom,
            zoomControl: false,
            maxZoom: siteConfig.map.maxZoom
        };

        // Create map
        var map = new L.Map('mymap', mapOptions);

        // Add tile layer
        var baseLayer = new L.TileLayer(
            siteConfig.map.tileLayer.url,
            { attribution: siteConfig.site.attribution }
        );
        map.addLayer(baseLayer);

        // Add controls
        map.addControl(L.control.zoom({ position: 'topright' }));
        map.addControl(L.control.scale({
            position: 'bottomright',
            imperial: false
        }));

        return map;
    },

    // Style functions
    styles: {
        buildings: function() {
            return siteConfig.styles.buildings;
        },
        communes: function() {
            return siteConfig.styles.communes;
        },
        trails: function(feature) {
            return Object.assign({}, siteConfig.styles.trails, {
                color: feature.properties.couleur
            });
        }
    },

    // Icon creation
    createIcon: function(category) {
        var iconConfig = siteConfig.icons.default;
        return L.icon({
            iconUrl: 'images/icons/' + mapConfig.formatIconName(category) + '.png',
            iconSize: iconConfig.size,
            iconAnchor: iconConfig.anchor,
            popupAnchor: iconConfig.popupAnchor
        });
    },

    // Helper function to format icon names
    formatIconName: function(name) {
        if (!name) return '';
        
        return name
            .toLowerCase()
            .replace(/ /g, '_')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-z0-9_]/g, '');
    }
};