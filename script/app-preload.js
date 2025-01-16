
popupOptions = {minWidth:350, maxWidth:350, maxHeight:400, closeButton:true}; //on défini la largeur max des popups à 400 pixels
var map;
var markers = L.markerClusterGroup(); // initialisation de la variable pour les clusters

// création de deux tableaux vides pour récupérer l'ensemble des années et catégories et gérer leur sélection/désélection
var tabCategories = new Array();
var tabCategories2 = new Array();
var poiLayers = new Array(); // tableau qui contiendra les features (données GeoJSON d'un point) et leur marker associé
var routeLayers = new Array();
var poly1 = new Array();

function displayRouteLayer(routeLayerId) {
    var isChecked = document.getElementById(routeLayerId).checked;
    if ((isChecked==true)&&(!map.hasLayer(routeLayers[routeLayerId]))) {
        routeLayers[routeLayerId];
    } else {
        if ((isChecked==false)&&(map.hasLayer(routeLayers[routeLayerId]))) {
            map.removeLayer(routeLayers[routeLayerId]);
        }
    }
}

function initialize() {
    /************************************************************************************************************************/
    /******************************************************* LA CARTE *******************************************************/
    /************************************************************************************************************************/

    //*******************CHARGEMENT DE LA CARTE***********************	
    
    //définition des options de la carte : centre, zoom, zoom maximum
    var point = new L.LatLng(48.231310963576654, -3.2563495712161874);
    var optionsDefaut = {
        center: point,
        zoom: 7.5,
        zoomControl : false,
        maxZoom: 20,
        // drawControl: true
    };

    //création de la carte et ajout du fond de carte
    map = new L.Map('mymap', optionsDefaut);
    var mapboxtest = new L.TileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png	',
        {attribution: 'Données 11/2024, Cartographie : <a href="https://www.linkedin.com/in/alexandreponchon/">Alexandre PONCHON </a> , <a href="https://www.openstreetmap.fr/">OSM</a>'}
    );
    map.addLayer(mapboxtest);

    //ajout des controles de la carte : zoom, échelle, contrôle des couches
    map.addControl(L.control.zoom({position: 'topright'}));
    map.addControl(L.control.scale({
        position: 'bottomright',
        imperial: false
    }));

    //*******************ajout couche perimetre OTPH***************************************************************			

    // Set up styles for subway lines
    
    function batimentsStyle(feature) {
        return {
            weight: 5,
            opacity: 1,
            borderColor : '#0f0f0f',
            
            fillOpacity: 0,
            interactive: true,
        };
    }

    function communesStyle(feature) {
        return {
            weight: 1,
            opacity: 1,
            color:'#0f0f0f',
            fillOpacity: 0,
            interactive: false,
        };
    }

    var bat = L.geoJson(
        communes,
        {style: communesStyle}
    ).addTo(map);

    routeLayers["bat"]=bat;

    //  fin couche  -----------------------------------------------
            

    //*****************CREATION DES PICTOS************************
    function categorieToPicto(categorie) {
        var file_name;
        file_name = categorie.replace(/ /gi,'_');
        file_name = file_name.toLowerCase();
        file_name = file_name.replace(new RegExp(/[àáâãäå]/g),"a");
        file_name = file_name.replace(new RegExp(/æ/g),"ae");
        file_name = file_name.replace(new RegExp(/ç/g),"c");
        file_name = file_name.replace(new RegExp(/[èéêë]/g),"e");
        file_name = file_name.replace(new RegExp(/[ìíîï]/g),"i");
        file_name = file_name.replace(new RegExp(/ñ/g),"n");
        file_name = file_name.replace(new RegExp(/[òóôõö]/g),"o");
        file_name = file_name.replace(new RegExp(/œ/g),"oe");
        file_name = file_name.replace(new RegExp(/[ùúûü]/g),"u");
        file_name = file_name.replace(new RegExp(/[ýÿ]/g),"y");
        file_name = file_name.replace(new RegExp(/'/g),"\'");
        return file_name;
    }

    function definePicto(categorie) {
        return L.icon({
            iconUrl: 'image/'+categorieToPicto(categorie)+'.png',
            iconSize: [30,30], // taille de l'icone en pixels
            iconAnchor: [13,13], // définition du point d'ancrage du picto par rapport au coin supérieur gauche
            popupAnchor: [0,-13], // définition du point d'ancrage de l'infobulle associée au picto, par rapport à l''iconAnchor'
        });
    }
    
    // définition des paramètres d'affichage des données
    var optionsAffichageDonnees = {
        pointToLayer: function (feature, latlng) { // Transforme l'entité récupérée dans le geoJson en marker sur la carte
            if (((feature.properties.sous_cat) != null) && ((feature.properties.sous_cat) != ""))
                return new L.Marker(latlng, {icon: definePicto(feature.properties.etape),title:feature.properties.nom});
        }
    }
    
    // *******************TEST*************************
    // contenu popup sentiers PDIPR
    /*
    function onEachFeature2(feature, layer) {
        var popupContent = "";
        if (feature.properties && feature.properties.nom) {
            popupContent += '<h6><b>'+feature.properties.nom+'</b></h6>';
            if (feature.properties && feature.properties.longueur) {
                popupContent += '<b>Longueur :</b> '+feature.properties.longueur+'<br>';
            }
            if (feature.properties && feature.properties.denivele) {
                popupContent += '<b>Denivelé :</b> '+feature.properties.denivele+' m<br>';
            }
            if (feature.properties && feature.properties.trace_gps) {
                popupContent += '<b>Trace GPS :</b> <a target="_blank" href='+feature.properties.trace_gps+'> fichier GPX à télécharger </a><br>';
            }
            if (feature.properties && feature.properties.site_web) {
                popupContent += '<b>Plus d\'infos :</b> <a target="_blank" href='+feature.properties.site_web+'> Carte et détails de la randonnée </a><br>';
            }
            
            if (feature.properties && feature.properties.source) {
                popupContent += '<b>Source des données :</b> '+feature.properties.source+'<br>';
            }
        }
        layer.bindPopup(popupContent);
    }
    */

    // Crée un style ( une couleur différente pour chacun) pour les sentiers
    // Set up styles for subway lines
    function sentierStyle(feature) {
        return {
            "color": feature.properties.couleur,
            "size":15,
            "weight": 9,
            "opacity": 1,
            "fillOpacity": 0,
            "clickable": false
        };
    }

    //ajout sentiers PDIPR
    var sentiers_pdipr = L.geoJson(
        sentiersPDIPR,
        {style: sentierStyle}
    )

    // https://github.com/naomap/leaflet-fusesearch/blob/master/src/leaflet.fusesearch.js
    L.Control.CustomFuseSearch = L.Control.FuseSearch.extend({

        // Surcharge de la méthode createResultItem de FuseSearch
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
                // Personnalisation de la méthode `createResultItem()`
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
            };

            return resultItem;
        }
    });

    // controle Fuzzy search en utilisant la version personnalisée de FuseSearch
    var searchCtrl = new L.Control.CustomFuseSearch({});
    searchCtrl.addTo(map);
    
    // https://github.com/naomap/leaflet-fusesearch#usage
    searchCtrl.indexFeatures(poi, ["nom","ville"]);	

    // *******************FIN TEST*************************

    for(let i=0; i < sentiers_pdipr.length;i++){
        let currentFeaturepdipr = sentiers_pdipr.feature[i];
        if (poly1[currentFeaturepdipr.properties.nom] == null) {
            poly1[currentFeaturepdipr.properties.nom] == new Array();
        }
        
    }

    // *******************DEFINITION DE L'AFFICHAGE DE BASE DES DONNEES*************************
    for (let i = 0; i < poi.features.length; i++) { // pour chaque entité du fichier geoJson POI
        var currentFeature = poi.features[i]; // on récupère l'entité courante dans une variable currentFeature
        // On récupère les catégories pour chaque feature
        if (tabCategories[currentFeature.properties.categorie] == null) { // si la catégorie de l'entité courante n'est pas initialisée dans le tableau tabCategories
            tabCategories[currentFeature.properties.categorie] = new Array(); // on lui affecte un nouveau tableau
        }
        if (currentFeature.properties.sous_cat!=null) // si l'entité courante possède une sous catégorie
            tabCategories[currentFeature.properties.categorie][currentFeature.properties.sous_cat] = true; // on lui affecte 'true' qui indiquera que les entités appartenant à cette sous-catégorie doivent être affichées sur la carte (au lancement de l'application)
        else // si l'entité courante ne possède pas de sous-catégorie, c'est donc que sa catégorie ne possède pas de sous-catégories
            tabCategories[currentFeature.properties.categorie]=true; // on affecte 'true' directement à cette catégorie dans le tableau tabCategories, ce qui indique que les entités appartenant à cette catégorie doivent être affichées sur la carte (au lancement de l'application)
        
        // On récupère les features et on créé leur couche associée. Pour le fonctionnement des clusters, on récupère le marker correspondant à chaque feature.
        // L'index correspond à l'identifiant de la feature (supposé unique)
        poiLayers[currentFeature.properties.id] = {
            "feature": currentFeature,
            "marker": optionsAffichageDonnees.pointToLayer(currentFeature, L.latLng(currentFeature.geometry.coordinates[1], currentFeature.geometry.coordinates[0]))
        };

        // Définition des popup et de leur contenu
        var popupContent =
        // Intitulé de l'entité + logo
        '<b><img class="imageflottante" src ="image/'+currentFeature.properties.logo+'.png" style="max-width:80px;max-height:60px;"></a><font size="3pt"><center>'+currentFeature.properties.nom+'</center></font></b>'
        
        //if (currentFeature.properties.logo != null && currentFeature.properties.logo != "") { // si l'entité courante contient un lien ou plusieurs liens vers des photos
        //	var photos = currentFeature.properties.logo; // On récupère les photos dans une variable
        //	var tabPhotos = photos.split(";");
        //	popupContent += '<img class="imageflottante" src ="image/'+currentFeature.properties.logo+'.png" style="width:50px;height:50px;"></a><br>';
        if ((currentFeature.properties.prenom_contact != null) && (currentFeature.properties.prenom_contact != ""))
            popupContent += '<b> Contact : </b>'+currentFeature.properties.prenom_contact+' '+currentFeature.properties.nom_contact+'<br>';
        if ((currentFeature.properties.Fonction != null) && (currentFeature.properties.Fonction != ""))
            popupContent += '<b> Fonction : </b>'+currentFeature.properties.Fonction+'<br>';

        if ((currentFeature.properties.tel != null) && (currentFeature.properties.tel != ""))
            popupContent += '<b>Tél: </b>'+currentFeature.properties.tel+'<br>';
            
        if ((currentFeature.properties.mail != null) && (currentFeature.properties.mail != ""))
            popupContent += '<b>Email: </b>'+currentFeature.properties.mail+'<br>';

        if ((currentFeature.properties.web != null) && (currentFeature.properties.web != "")) // si l'entité courante a un lien
            popupContent += '<b>Site Web : </b><a target="_blank" href="'+currentFeature.properties.web+'"><i><u>cliquer ici</i></u></a><br>'; // on ajoute ce lien au contenu de la popup
        // dans le tableau poiLayers, on affecte au marker de l'entité correspondante une popup dont le contenu vient d'être défini
                

        //}
        //if ((currentFeature.properties.zig != null) && (currentFeature.properties.zig != ""))
            //popupContent += '<b>Zone d\'intervention géographique : </b>'+currentFeature.properties.zig+'<br>';

        if ((currentFeature.properties.zig != null) && (currentFeature.properties.zig != ""))
            popupContent += '<b>Zone d\'intervention : </b>'+currentFeature.properties.zig+'<br>';
            if ((currentFeature.properties.accessibilité != "Non"))
            
        //if ((currentFeature.properties.adresse != null) && (currentFeature.properties.adresse != ""))
        //	popupContent += '<b>Adresse : </b>'+currentFeature.properties.adresse+' '+currentFeature.properties.cp+' '+currentFeature.properties.ville+'<br>';

        //if ((currentFeature.properties.txt_1 != null) && (currentFeature.properties.txt_1 != ""))
        //	popupContent += '<b>Nombre de projets ESS accompagnés ou financé par an : </b>'+currentFeature.properties.txt_1+'<br>';
        if ((currentFeature.properties.nom != null) && (currentFeature.properties.nom != ""))
            popupContent += '<b>Adresse :  </b> ';
        if ((currentFeature.properties.adresse != null) && (currentFeature.properties.adresse != ""))
            popupContent += currentFeature.properties.adresse+' - ';
        if ((currentFeature.properties.cp != null) && (currentFeature.properties.cp != ""))
            popupContent += +currentFeature.properties.cp+' - '+currentFeature.properties.ville+	'<br>';
    
        if ((currentFeature.properties.etape_1 != null) && (currentFeature.properties.etape_1 != ""))
            popupContent += '<b>Etape de maturité accompagnée :  </b><br> ';
        if ((currentFeature.properties.etape_1 != null) && (currentFeature.properties.etape_1 != ""))
            popupContent +='<li>'+currentFeature.properties.etape_1+'</li>';
        if ((currentFeature.properties.etape_2 != null) && (currentFeature.properties.etape_2 != ""))
            popupContent +='<li>'+currentFeature.properties.etape_2+'</li>';
        if ((currentFeature.properties.etape_3 != null) && (currentFeature.properties.etape_3 != ""))
            popupContent +='<li>'+currentFeature.properties.etape_3+'</li>';
        if ((currentFeature.properties.etape_4 != null) && (currentFeature.properties.etape_4 != ""))
            popupContent +='<li>'+currentFeature.properties.etape_4+'</li>';
        if ((currentFeature.properties.etape_5 != null) && (currentFeature.properties.etape_5 != ""))
            popupContent +='<li>'+currentFeature.properties.etape_5+'</li>';
        if ((currentFeature.properties.etape_6 != null) && (currentFeature.properties.etape_6 != ""))
            popupContent +='<li>'+currentFeature.properties.etape_6+'</li>';
        if ((currentFeature.properties.acc_1 != null) && (currentFeature.properties.acc_1 != ""))
            popupContent +='<b>Dispositifs ou programmes d\'accompagnement : </b>';
        if ((currentFeature.properties.acc_1 != null) && (currentFeature.properties.acc_1 != ""))
            popupContent +='<li>'+currentFeature.properties.acc_1+'</li>';
        if ((currentFeature.properties.acc_2 != null) && (currentFeature.properties.acc_2 != ""))
            popupContent +='<li>'+currentFeature.properties.acc_2+'</li>';
        if ((currentFeature.properties.acc_3 != null) && (currentFeature.properties.acc_3 != ""))
            popupContent +='<li>'+currentFeature.properties.acc_3+'</li>';
        if ((currentFeature.properties.acc_4 != null) && (currentFeature.properties.acc_4 != ""))
            popupContent +='<li>'+currentFeature.properties.acc_4+'</li>';
        if ((currentFeature.properties.acc_5 != null) && (currentFeature.properties.acc_5 != ""))
            popupContent +='<li>'+currentFeature.properties.acc_5+'</li>';
        if ((currentFeature.properties.acc_6 != null) && (currentFeature.properties.acc_6 != ""))
            popupContent +='<li>'+currentFeature.properties.acc_6+'</li>';
        if ((currentFeature.properties.etape_fin_1 != null) && (currentFeature.properties.etape_fin_1 != ""))
            popupContent += '<b>Etape de maturité financée : </b>';
        if ((currentFeature.properties.etape_fin_1 != null) && (currentFeature.properties.etape_fin_1 != ""))
            popupContent += '<li>'+currentFeature.properties.etape_fin_1+'</li>';
        if ((currentFeature.properties.etape_fin_2 != null) && (currentFeature.properties.etape_fin_2 != ""))
            popupContent += '<li>'+currentFeature.properties.etape_fin_2+'</li>';
        if ((currentFeature.properties.etape_fin_3 != null) && (currentFeature.properties.etape_fin_3 != ""))
            popupContent += '<li>'+currentFeature.properties.etape_fin_3+'</li>';
        if ((currentFeature.properties.etape_fin_5 != null) && (currentFeature.properties.etape_fin_5 != ""))
            popupContent += '<li>'+currentFeature.properties.etape_fin_5+'</li>';
        if ((currentFeature.properties.fin_1 != null) && (currentFeature.properties.fin_1 != ""))
            popupContent += '<b>Dispositifs ou programmes de financement : </b><br>';
        if ((currentFeature.properties.fin_1 != null) && (currentFeature.properties.fin_1 != ""))
            popupContent += '<li>'+currentFeature.properties.fin_1+'</li>';
        if ((currentFeature.properties.fin_2 != null) && (currentFeature.properties.fin_2 != ""))
            popupContent += '<li>'+currentFeature.properties.fin_2+'</li>';
        if ((currentFeature.properties.fin_3 != null) && (currentFeature.properties.fin_3 != ""))
            popupContent += '<li>'+currentFeature.properties.fin_3+'</li>';
        if ((currentFeature.properties.fin_4 != null) && (currentFeature.properties.fin_4 != ""))
            popupContent += '<li>'+currentFeature.properties.fin_4+'</li>';
        if ((currentFeature.properties.fin_5 != null) && (currentFeature.properties.fin_5 != ""))
            popupContent += '<li>'+currentFeature.properties.fin_5+'</li>';
        if ((currentFeature.properties.fin_6 != null) && (currentFeature.properties.fin_6 != ""))
            popupContent += '<li>'+currentFeature.properties.fin_6+'</li>';
        if ((currentFeature.properties.fin_7 != null) && (currentFeature.properties.fin_7 != ""))
            popupContent += '<li>'+currentFeature.properties.fin_7+'</li>';		
        if ((currentFeature.properties.txt_4 != null) && (currentFeature.properties.txt_4 != ""))
            popupContent +='<li>'+currentFeature.properties.txt_4+'</li>';
        if ((currentFeature.properties.zig == "ille_et_vilaine"))
        poiLayers[currentFeature.properties.id].marker.on("popupopen", function() {
            var layer_ille_et_vilaine_0 = new L.geoJson(IEV35,{});
            var layerGroup1 =new L.LayerGroup();
            layerGroup1.addLayer(layer_ille_et_vilaine_0);
            layerGroup1.addTo(map);
            map.on('popupclose',function(event){
            map.removeLayer(layerGroup1);
    })	})	
    if ((currentFeature.properties.zig == "bretagne"))
        poiLayers[currentFeature.properties.id].marker.on("popupopen", function() {
            var layer_ille_et_vilaine_0 = new L.geoJson(bretagne,{});
            var layerGroup1 =new L.LayerGroup();
            layerGroup1.addLayer(layer_ille_et_vilaine_0);
            layerGroup1.addTo(map);
            map.on('popupclose',function(event){
            map.removeLayer(layerGroup1);
    })	})
    if ((currentFeature.properties.zig == "pdb"))
        poiLayers[currentFeature.properties.id].marker.on("popupopen", function() {
            var layer_ille_et_vilaine_0 = new L.geoJson(pdb,{});
            var layerGroup1 =new L.LayerGroup();
            layerGroup1.addLayer(layer_ille_et_vilaine_0);
            layerGroup1.addTo(map);
            map.on('popupclose',function(event){
            map.removeLayer(layerGroup1);
    })	})

        if (typeof(poiLayers[currentFeature.properties.id].marker)!="undefined") {
            poiLayers[currentFeature.properties.id].marker.bindPopup (popupContent, popupOptions);
            
            // ajoute un événement "popupopen" au marker qui va exécuter la fonction suivante une fois la popup ouverte
            poiLayers[currentFeature.properties.id].marker.on("popupopen", function() {
                // on lance le slider à l'ouverture de la popup
                $(".rslides").responsiveSlides({
                    auto: true,
                    pager: true,
                    nav: false,
                    speed: 500,
                    namespace: "centered-btns"
                });
            });
            // on ajoute à notre marker-cluster une couche contenant le marker correspondant à l'entité courante
            markers.addLayer(poiLayers[currentFeature.properties.id].marker);
        }
    }
    
    map.addLayer(markers); // on ajoute notre 'markerClusterGroup' à la carte 
    
    //**********************LEGENDE***************************	

    // Retourne le code couleur correspondant à l'élément passé en paramètre de la forme CTPN, CMPN, AMAPN, AAPN, APAPN	
    for (let i = 0; i < poi.features.length; i++) { // pour chaque entité du fichier geoJson POI
        let currentFeature2 = poi.features[i]; // on récupère l'entité courante dans une variable currentFeature
        // On récupère les catégories pour chaque feature
        if (tabCategories2[currentFeature2.properties.categorie] == null) { // si la catégorie de l'entité courante n'est pas initialisée dans le tableau tabCategories
            tabCategories2[currentFeature2.properties.categorie] = new Array(); // on lui affecte un nouveau tableau
        }
        if (currentFeature2.properties.sous_cat!=null) // si l'entité courante possède une sous catégorie
            tabCategories2[currentFeature2.properties.categorie][currentFeature2.properties.etape] = true; // on lui affecte 'true' qui indiquera que les entités appartenant à cette sous-catégorie doivent être affichées sur la carte (au lancement de l'application)
        else // si l'entité courante ne possède pas de sous-catégorie, c'est donc que sa catégorie ne possède pas de sous-catégories
            tabCategories2[currentFeature2.properties.categorie] = true; // on affecte 'true' directement à cette catégorie dans le tableau tabCategories, ce qui indique que les entités appartenant à cette catégorie doivent être affichées sur la carte (au lancement de l'application)

        // On récupère les features et on créé leur couche associée. Pour le fonctionnement des clusters, on récupère le marker correspondant à chaque feature.
        // L'index correspond à l'identifiant de la feature (supposé unique)
    };

    // Ajout de toutes les catégories au menu de gauche
    let selectCategories = ''
    for (i in tabCategories) {
        console.log(tabCategories[i])
        for (j in tabCategories[i]) {
            selectCategories +=
                `<div class="cell auto">
                    <input type="checkbox" id="${j}" class="custom-checkbox" checked="true" onclick="onDisplayCheckBoxChanged('${j}', '${i}');">
                    <label for="${j}" class="custom-label">${j}</label>
                </div>`
        }
    }
    $('#select-list')
        .html(selectCategories)

    // Ajout de toutes les catégories au menu de gauche
    let selectCategories2 = ''
    for (i in tabCategories2) {
        for (j in tabCategories2[i]) {
            selectCategories2 +=
                `<div class="cell auto">
                    <img style="width:25px; height:25px;" src="image/${categorieToPicto(j)}.png">&nbsp ${j}
                </div`
        }
    }
    $('#select-list2').html(selectCategories2)

    // Redéfinit la taille de la carte et de la barre de titre à chaque redimensionnement de la fenêtre
    function resize() { 
        $('#mymap').css("height", ($(window).height() - $('.tab-bar').height()));
        $('.tab-bar .middle').css("left", $('.left-small').width());
        $('.tab-bar .middle').css("right", $('.right-small').width());
        map.invalidateSize();
    }
    resize();
    $(window).on("resize", resize);
    map.fitBounds(perimetre_gip.getBounds()); // Zoom automatique sur l'emprise du perimètre d'étude

} //End initialize()


//************* GESTION DU DEPLIAGE DES CATEGORIES ****************

function displayCategories(clickedEl) {
    /* Toggle between hiding and showing the active panel */
    let panel = clickedEl.nextElementSibling;
    if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
    } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
    }
}


//******************FONCTIONNEMENT DU MENU GAUCHE : FILTRER LES CATEGORIES********************	

// Mise à jour de l'affichage des pictos, appelée dès qu'il se passe une action au niveau du menu de gauche
function majAffichage() {
    map.removeLayer(markers); // on commence par retirer de la carte tous les markers
    for (idLayer in poiLayers) { // Pour chaque identifiant (clé) du tableau des features (entités)
        var currentLayer = poiLayers[idLayer]; // on récupère l'entité courante dans une variable 'currentLayer'
        // si l'entité courante possède une sous catégorie
        if (tabCategories[currentLayer.feature.properties.categorie][currentLayer.feature.properties.sous_cat]!=null) {
            // si la sous-catégorie de l'entité courante doit être affichée sur la carte et qu'au moins une année rattachée à cette entité doit être affichée
            if (tabCategories[currentLayer.feature.properties.categorie][currentLayer.feature.properties.sous_cat]==true) {
                if (! markers.hasLayer(currentLayer.marker)) { // si le marker n'est pas encore affiché
                    markers.addLayer(currentLayer.marker); // on l'affiche
                }
            } else { // il ne doit pas être affiché
                if (markers.hasLayer(currentLayer.marker)) {// s'il est affiché
                    markers.removeLayer(currentLayer.marker); // on l'enlève
                }
            }
        } else { // sinon : l'entité courante ne possède pas de sous-catégorie, donc uniquement une catégorie-mère
            // si la catégorie de l'entité courante doit être affichée sur la carte et qu'au moins une année rattachée à cette entité doit être affichée
            if (tabCategories[currentLayer.feature.properties.categorie]==true) {
                if (! markers.hasLayer(currentLayer.marker)) { // si le marker n'est pas encore affiché
                    markers.addLayer(currentLayer.marker); // on l'affiche
                }
            } else { // il ne doit pas être affiché
                if (markers.hasLayer(currentLayer.marker)) {// s'il est affiché
                    markers.removeLayer(currentLayer.marker); // on l'enlève
                }
            }
        }
    }
    map.addLayer(markers); // on ajoute les markers mis à jour à la carte
}

// Récupère la catégorie correspondant à une sous catégorie donnée
function getCategorie(sousCategorie) {
    for (i in tabCategories) { // pour chaque catégorie du tableau tabCategories
        for (j in tabCategories[i]) { // pour toutes les sous-catégorie de cette catégorie
            if (j==sousCategorie) // si la sous-catégorie courante correspond à la sous-catégorie recherchée
                return i; // on retourne sa catégorie-mère
        }
    }
}

// Définit les catégories et sous catégories qui doivent être affichées ou non dès qu'une checkbox à été cliquée
function onDisplayCheckBoxChanged(idChangedElement, parentCategoryId) {
    tabCategories[parentCategoryId][idChangedElement] = document.getElementById(idChangedElement).checked; // on met à jour sa valeur dans tabCategories : true si la sous-catégorie vient d'être cochée, false sinon
    
    majAffichage(); // Mise à jour de l'affichage des données sur la carte
}
