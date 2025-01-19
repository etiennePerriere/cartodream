// Global variables
var map;
var markers = L.markerClusterGroup();
var tabCategories = new Array();
var tabCategories2 = new Array();
var poiLayers = new Array();
var routeLayers = new Array();
var poly1 = new Array();


// Custom FuseSearch extension
L.Control.CustomFuseSearch = L.Control.FuseSearch.extend({
    // Overriding the createResultItem method of FuseSearch
    createResultItem: function(props, container, popup) {
        var _this = this;
        var feature = props._feature;
        // Create a container and open the associated popup on click
        var resultItem = L.DomUtil.create('p', 'result-item', container);

        if (undefined !== popup) {
            L.DomUtil.addClass(resultItem, 'clickable');
            resultItem.onclick = function() {
                if (window.matchMedia("(max-width:480px)").matches) {
                    _this.hidePanel();
                    feature.layer.openPopup();
                } else {
                    _this._panAndPopup(feature, popup);
                }
            };
        } else {
            // Custom result item behavior
            L.DomUtil.addClass(resultItem, 'clickable');
            resultItem.onclick = function() {
                var longitude = feature.geometry.coordinates[0];
                var latitude = feature.geometry.coordinates[1];
                map.flyTo([latitude, longitude], 16);
            };
        }

        // Fill in the container with the user-supplied function if any,
        // otherwise display the feature properties used for the search.
        if (null !== this.options.showResultFct) {
            this.options.showResultFct(feature, resultItem);
        } else {
            str = '<b>' + props[this._keys[0]] + '</b>';
            for (var i = 1; i < this._keys.length; i++) {
                str += '<br/>' + props[this._keys[i]];
            }
            resultItem.innerHTML = str;
        }

        return resultItem;
    }
});

function displayRouteLayer(routeLayerId) {
    var isChecked = document.getElementById(routeLayerId).checked;
    if ((isChecked == true) && (!map.hasLayer(routeLayers[routeLayerId]))) {
        routeLayers[routeLayerId];
    } else {
        if ((isChecked == false) && (map.hasLayer(routeLayers[routeLayerId]))) {
            map.removeLayer(routeLayers[routeLayerId]);
        }
    }
}

// Get the category corresponding to a subcategory
function getCategorie(sousCategorie) {
    for (var i in tabCategories) {
        for (var j in tabCategories[i]) {
            if (j == sousCategorie)
                return i;
        }
    }
}

// Update display when checkbox state changes
function onDisplayCheckBoxChanged(idChangedElement, parentCategoryId) {
    tabCategories[parentCategoryId][idChangedElement] = document.getElementById(idChangedElement).checked;
    majAffichage();
}

// Update map display based on checkbox states
function majAffichage() {
    map.removeLayer(markers);
    for (var idLayer in poiLayers) {
        var currentLayer = poiLayers[idLayer];
        if (currentLayer.feature.properties.sous_cat != null) {
            if (tabCategories[currentLayer.feature.properties.categorie][currentLayer.feature.properties.sous_cat] == true) {
                if (!markers.hasLayer(currentLayer.marker)) {
                    markers.addLayer(currentLayer.marker);
                }
            } else {
                if (markers.hasLayer(currentLayer.marker)) {
                    markers.removeLayer(currentLayer.marker);
                }
            }
        } else {
            if (tabCategories[currentLayer.feature.properties.categorie] == true) {
                if (!markers.hasLayer(currentLayer.marker)) {
                    markers.addLayer(currentLayer.marker);
                }
            } else {
                if (markers.hasLayer(currentLayer.marker)) {
                    markers.removeLayer(currentLayer.marker);
                }
            }
        }
    }
    map.addLayer(markers);
}

function initialize() {
    // Initialize the map using config
    map = mapConfig.initializeMap();
    
    // Setup communes layer using config styles
    var bat = L.geoJson(
        communes,
        { style: mapConfig.styles.communes }
    ).addTo(map);
    routeLayers["bat"] = bat;

    // Marker setup configuration
    var optionsAffichageDonnees = {
        pointToLayer: function(feature, latlng) {
            if (((feature.properties.sous_cat) != null) && ((feature.properties.sous_cat) != "")) {
                return new L.Marker(latlng, {
                    icon: mapConfig.createIcon(feature.properties.etape),
                    title: feature.properties.nom
                });
            }
        }
    };

    // Initialize search control
    var searchCtrl = new L.Control.CustomFuseSearch();
    searchCtrl.addTo(map);
    searchCtrl.indexFeatures(poi, ["nom", "ville"]);

    // Initialize sentiers with config styles
    var sentiers_pdipr = L.geoJson(
        sentiersPDIPR,
        { style: mapConfig.styles.trails }
    );

    // Process POI data
    for (var i = 0; i < poi.features.length; i++) {
        var currentFeature = poi.features[i];
        
        // Categories initialization
        if (tabCategories[currentFeature.properties.categorie] == null) {
            tabCategories[currentFeature.properties.categorie] = new Array();
        }
        
        if (currentFeature.properties.sous_cat != null) {
            tabCategories[currentFeature.properties.categorie][currentFeature.properties.sous_cat] = true;
        } else {
            tabCategories[currentFeature.properties.categorie] = true;
        }

        // Categories2 initialization (for icons)
        if (tabCategories2[currentFeature.properties.categorie] == null) {
            tabCategories2[currentFeature.properties.categorie] = new Array();
        }
        if (currentFeature.properties.sous_cat != null) {
            tabCategories2[currentFeature.properties.categorie][currentFeature.properties.etape] = true;
        } else {
            tabCategories2[currentFeature.properties.categorie] = true;
        }

        // Layer creation
        poiLayers[currentFeature.properties.id] = {
            "feature": currentFeature,
            "marker": optionsAffichageDonnees.pointToLayer(
                currentFeature, 
                L.latLng(currentFeature.geometry.coordinates[1], currentFeature.geometry.coordinates[0])
            )
        };

        // Create and bind popup
        if (typeof(poiLayers[currentFeature.properties.id].marker) != "undefined") {
            var popupContent = createPopupContent(currentFeature);
            poiLayers[currentFeature.properties.id].marker.bindPopup(
                popupContent,
                siteConfig.popup.options
            );
            
            setupPopupEvents(currentFeature, poiLayers[currentFeature.properties.id].marker);
            markers.addLayer(poiLayers[currentFeature.properties.id].marker);
        }
    }
    
    map.addLayer(markers);
    
    // Create filter lists
    createFilterLists();
    
    // Setup resize handling
    setupResizeHandlers();
}

function createPopupContent(feature) {
    var content = '';
    
    // Logo and title
    content += '<b><img class="imageflottante" src="images/icons/' + feature.properties.logo + 
               '.png" style="max-width:80px;max-height:60px;"></a><font size="3pt"><center>' + 
               feature.properties.nom + '</center></font></b>';

    // Contact information
    if (feature.properties.prenom_contact && feature.properties.prenom_contact != "") {
        content += '<b>Contact : </b>' + feature.properties.prenom_contact + ' ' + 
                  feature.properties.nom_contact + '<br>';
    }

    if (feature.properties.Fonction && feature.properties.Fonction != "") {
        content += '<b>Fonction : </b>' + feature.properties.Fonction + '<br>';
    }

    if (feature.properties.tel && feature.properties.tel != "") {
        content += '<b>Tél: </b>' + feature.properties.tel + '<br>';
    }

    if (feature.properties.mail && feature.properties.mail != "") {
        content += '<b>Email: </b>' + feature.properties.mail + '<br>';
    }

    if (feature.properties.web && feature.properties.web != "") {
        content += '<b>Site Web : </b><a target="_blank" href="' + feature.properties.web + 
                  '"><i><u>cliquer ici</i></u></a><br>';
    }

    // Address
    if (feature.properties.nom != null && feature.properties.nom != "") {
        content += '<b>Adresse : </b>';
    }
    if (feature.properties.adresse != null && feature.properties.adresse != "") {
        content += feature.properties.adresse + ' - ';
    }
    if (feature.properties.cp != null && feature.properties.cp != "") {
        content += feature.properties.cp + ' - ' + feature.properties.ville + '<br>';
    }

    // Add all other properties (stages, programs, etc.)
    content = addPropertyListToContent(content, feature.properties, 'etape_', 
             '<b>Etape de maturité accompagnée : </b><br>');
    content = addPropertyListToContent(content, feature.properties, 'acc_',
             '<b>Dispositifs ou programmes d\'accompagnement : </b>');
    content = addPropertyListToContent(content, feature.properties, 'etape_fin_',
             '<b>Etape de maturité financée : </b>');
    content = addPropertyListToContent(content, feature.properties, 'fin_',
             '<b>Dispositifs ou programmes de financement : </b><br>');

    return content;
}

function addPropertyListToContent(content, properties, prefix, header) {
    var hasItems = false;
    var tempContent = '';
    
    for (var prop in properties) {
        if (prop.startsWith(prefix) && properties[prop] && properties[prop] != "") {
            if (!hasItems) {
                tempContent += header;
                hasItems = true;
            }
            tempContent += '<li>' + properties[prop] + '</li>';
        }
    }
    
    return content + (hasItems ? tempContent : '');
}

function setupPopupEvents(feature, marker) {
    marker.on("popupopen", function() {
        if (feature.properties.zig) {
            setupZoneDisplay(feature.properties.zig);
        }
        
        // Initialize slider if needed
        $(".rslides").responsiveSlides({
            auto: true,
            pager: true,
            nav: false,
            speed: 500,
            namespace: "centered-btns"
        });
    });
}

function setupZoneDisplay(zoneType) {
    var layer, data;
    
    switch(zoneType) {
        case "ille_et_vilaine":
            data = IEV35;
            break;
        case "bretagne":
            data = bretagne;
            break;
        case "pdb":
            data = pdb;
            break;
        default:
            return;
    }
    
    var zoneLayer = new L.geoJson(data, {});
    var layerGroup = new L.LayerGroup();
    layerGroup.addLayer(zoneLayer);
    layerGroup.addTo(map);
    
    map.on('popupclose', function() {
        map.removeLayer(layerGroup);
    });
}

function createFilterLists() {
    var selectCategories = '';
    for (var i in tabCategories) {
        for (var j in tabCategories[i]) {
            selectCategories += 
                '<div class="cell auto">' +
                    '<input type="checkbox" id="' + j + '" class="custom-checkbox"' +
                    'checked="true" onclick="onDisplayCheckBoxChanged(\'' + j + '\', \'' + i + '\');">' +
                    '<label for="' + j + '" class="custom-label">' + j + '</label>' +
                '</div>';
        }
    }
    $('#select-list').html(selectCategories);

    var selectCategories2 = '';
    for (var i in tabCategories2) {
        for (var j in tabCategories2[i]) {
            selectCategories2 += 
                '<div class="cell auto">' +
                    '<img style="width:25px; height:25px;" src="images/icons/' + 
                    mapConfig.formatIconName(j) + '.png">&nbsp ' + j +
                '</div>';
        }
    }
    $('#select-list2').html(selectCategories2);
}

function setupResizeHandlers() {
    function resize() {
        $('#mymap').css("height", ($(window).height() - $('header').height()));
        map.invalidateSize();
    }
    resize();
    $(window).on("resize", resize);
}