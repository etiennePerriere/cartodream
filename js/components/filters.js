var FilterComponent = {
    tabCategories: new Array(),
    tabCategories2: new Array(),
    poiLayers: new Array(),

    initialize: function() {
        // First clear any existing markers
        markers.clearLayers();
        map.removeLayer(markers);
        
        // Process features and create filter lists
        this.processFeatures();
        this.createFilterLists();
        
        // Add markers to map after all processing is done
        map.addLayer(markers);
    },

    processFeatures: function() {
        for (var i = 0; i < poi.features.length; i++) {
            var currentFeature = poi.features[i];
            
            // Categories initialization
            if (this.tabCategories[currentFeature.properties.categorie] == null) {
                this.tabCategories[currentFeature.properties.categorie] = new Array();
            }
            
            if (currentFeature.properties.sous_cat != null) {
                this.tabCategories[currentFeature.properties.categorie][currentFeature.properties.sous_cat] = true;
            } else {
                this.tabCategories[currentFeature.properties.categorie] = true;
            }

            // Categories2 initialization (for icons)
            if (this.tabCategories2[currentFeature.properties.categorie] == null) {
                this.tabCategories2[currentFeature.properties.categorie] = new Array();
            }
            if (currentFeature.properties.sous_cat != null) {
                this.tabCategories2[currentFeature.properties.categorie][currentFeature.properties.etape] = true;
            } else {
                this.tabCategories2[currentFeature.properties.categorie] = true;
            }

            // Layer creation
            this.poiLayers[currentFeature.properties.id] = {
                "feature": currentFeature,
                "marker": MapComponent.createMarker(
                    currentFeature, 
                    L.latLng(currentFeature.geometry.coordinates[1], currentFeature.geometry.coordinates[0])
                )
            };

            // Create and bind popup
            if (typeof(this.poiLayers[currentFeature.properties.id].marker) != "undefined") {
                var popupContent = PopupComponent.createContent(currentFeature);
                this.poiLayers[currentFeature.properties.id].marker.bindPopup(
                    popupContent,
                    siteConfig.popup.options
                );
                
                PopupComponent.setupEvents(currentFeature, this.poiLayers[currentFeature.properties.id].marker);
                markers.addLayer(this.poiLayers[currentFeature.properties.id].marker);
            }
        }
    },

    createFilterLists: function() {
        var selectCategories = '';
        for (var i in this.tabCategories) {
            for (var j in this.tabCategories[i]) {
                selectCategories += 
                    '<div class="cell auto">' +
                        '<input type="checkbox" id="' + j + '" class="custom-checkbox"' +
                        'checked="true" onclick="FilterComponent.onDisplayCheckBoxChanged(\'' + j + '\', \'' + i + '\');">' +
                        '<label for="' + j + '" class="custom-label">' + j + '</label>' +
                    '</div>';
            }
        }
        $('#select-list').html(selectCategories);

        var selectCategories2 = '';
        for (var i in this.tabCategories2) {
            for (var j in this.tabCategories2[i]) {
                selectCategories2 += 
                    '<div class="cell auto">' +
                        '<img style="width:25px; height:25px;" src="images/icons/' + 
                        mapConfig.formatIconName(j) + '.png">&nbsp ' + j +
                    '</div>';
            }
        }
        $('#select-list2').html(selectCategories2);
    },

    getCategorie: function(sousCategorie) {
        for (var i in this.tabCategories) {
            for (var j in this.tabCategories[i]) {
                if (j == sousCategorie)
                    return i;
            }
        }
    },

    onDisplayCheckBoxChanged: function(idChangedElement, parentCategoryId) {
        this.tabCategories[parentCategoryId][idChangedElement] = document.getElementById(idChangedElement).checked;
        this.updateDisplay();
    },

    updateDisplay: function() {
        map.removeLayer(markers);
        for (var idLayer in this.poiLayers) {
            var currentLayer = this.poiLayers[idLayer];
            if (currentLayer.feature.properties.sous_cat != null) {
                if (this.tabCategories[currentLayer.feature.properties.categorie][currentLayer.feature.properties.sous_cat] == true) {
                    if (!markers.hasLayer(currentLayer.marker)) {
                        markers.addLayer(currentLayer.marker);
                    }
                } else {
                    if (markers.hasLayer(currentLayer.marker)) {
                        markers.removeLayer(currentLayer.marker);
                    }
                }
            } else {
                if (this.tabCategories[currentLayer.feature.properties.categorie] == true) {
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
};

// Export for global use
window.FilterComponent = FilterComponent;