// Global site configuration
var siteConfig = {
    // Site Content
    site: {
        title: "Acteurs de l'accompagnement et du financement de l'entrepreneuriat à impact en Bretagne",
        attribution: 'Données 11/2024, Cartographie : <a href="https://www.linkedin.com/in/alexandreponchon/">Alexandre PONCHON </a> , <a href="https://www.openstreetmap.fr/">OSM</a>'
    },

    // UI Text
    ui: {
        filters: {
            deviceTypesLabel: "Porte un dispositif dédié aux",
            actorTypesLabel: "Typologie d'acteurs",
            regionLabel: "Délimitation des EPCI Bretons",
            searchPlaceholder: "Rechercher"
        },
        help: {
            title: "Conseils",
            content: "Le menu gauche permet la sélection des différents élements." +
                    "<br><br>" +
                    "Vous pouvez effectuer une recherche par acteur (ou par ville) en cliquant sur la loupe, " +
                    "et en tapant le nom recherché"
        }
    },

    /********************
    * MAP CONFIGURATION *
    ********************/
    map: {
        center: {
            lat: 48.81826349423801,
            lng: 1.6032443265782088
        },
        defaultZoom: 11,
        maxZoom: 20,
        zoomControl : false,
        tileLayer: {
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
    },

    // Popup Configuration
    popup: {
        options: {
            minWidth: 350,
            maxWidth: 350,
            maxHeight: 400,
            closeButton: true
        }
    },

    // Icon Configuration
    icons: {
        default: {
            size: [25, 25],
            anchor: [13, 13],
            popupAnchor: [0, -13]
        }
    },

    // Feature Styles
    styles: {
        buildings: {
            weight: 5,
            opacity: 1,
            borderColor: '#0f0f0f',
            fillOpacity: 0
        },
        mapLines: {
            weight: 2,
            opacity: 1,
            color: '#9f5cc0',
            fillColor: '#9f5cc0',
            fillOpacity: 0.2,
            interactive: false,
        },
        trails: {
            weight: 9,
            opacity: 1,
            fillOpacity: 0
        }
    }
};