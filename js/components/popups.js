var PopupComponent = {
    createContent: function(feature) {
        var content = '';
        
        // Logo and title
        content += '<b><img class="imageflottante" src="images/data/' + feature.properties.logo + 
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

        // Add all other properties
        content = this.addPropertyListToContent(content, feature.properties, 'etape_', 
                 '<b>Etape de maturité accompagnée : </b><br>');
        content = this.addPropertyListToContent(content, feature.properties, 'acc_',
                 '<b>Dispositifs ou programmes d\'accompagnement : </b>');
        content = this.addPropertyListToContent(content, feature.properties, 'etape_fin_',
                 '<b>Etape de maturité financée : </b>');
        content = this.addPropertyListToContent(content, feature.properties, 'fin_',
                 '<b>Dispositifs ou programmes de financement : </b><br>');

        return content;
    },

    addPropertyListToContent: function(content, properties, prefix, header) {
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
    },

    setupEvents: function(feature, marker) {
        marker.on("popupopen", function() {
            if (feature.properties.zig) {
                PopupComponent.setupZoneDisplay(feature.properties.zig);
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
    },

    setupZoneDisplay: function(zoneType) {
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
};

// Export for global use
window.PopupComponent = PopupComponent;