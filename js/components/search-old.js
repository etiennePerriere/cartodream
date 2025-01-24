// Custom FuseSearch extension
L.Control.CustomFuseSearch = L.Control.FuseSearch.extend({
    createResultItem: function(props, container, popup) {
        var _this = this;
        var feature = props._feature;
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
            L.DomUtil.addClass(resultItem, 'clickable');
            resultItem.onclick = function() {
                var longitude = feature.geometry.coordinates[0];
                var latitude = feature.geometry.coordinates[1];
                map.flyTo([latitude, longitude], 16);
            };
        }

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

var SearchComponent = {
    initialize: function() {
        this.setupSearch();
    },

    setupSearch: function() {
        var searchCtrl = new L.Control.CustomFuseSearch();
        searchCtrl.addTo(map);
        searchCtrl.indexFeatures(poi, ["nom", "ville"]);
    }
};

// Export for global use
window.SearchComponent = SearchComponent;