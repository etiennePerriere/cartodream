var SearchComponent = {
    initialize: function() {
        this.setupSearch();
        this.setupSearchListeners();
        this.setupClickOutside();
    },

    setupSearch: function() {
        var options = {
            keys: ["properties.nom", "properties.ville"],
            threshold: 0.3,
            includeMatches: true
        };
        this.fuse = new Fuse(mapPOIs.features, options);
    },

    setupSearchListeners: function() {
        var self = this;
        var searchContainers = document.querySelectorAll('.search-container');
        
        searchContainers.forEach(function(container) {
            var input = container.querySelector('.input-group-field');
            var resultsContainer = container.querySelector('.search-results');
            
            input.addEventListener('input', function(e) {
                var searchValue = e.target.value;
                if (searchValue.length > 2) {
                    var results = self.fuse.search(searchValue);
                    self.showResults(results, resultsContainer);
                } else {
                    self.hideResults(resultsContainer);
                }
            });

            // Prevent search results from closing when clicking inside
            resultsContainer.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    },

    setupClickOutside: function() {
        // Hide results when clicking outside
        document.addEventListener('click', function() {
            document.querySelectorAll('.search-results').forEach(function(container) {
                this.hideResults(container);
            }.bind(this));
        }.bind(this));
    },

    showResults: function(results, container) {
        if (!results.length) {
            this.hideResults(container);
            return;
        }

        var html = '';
        results.forEach(function(result) {
            html += '<div class="search-result-item" ' +
                   'data-lat="' + result.geometry.coordinates[1] + '" ' +
                   'data-lng="' + result.geometry.coordinates[0] + '" ' +
                   'data-id="' + result.properties.id + '">' +
                   '<b>' + result.properties.nom + '</b>';
            
            if (result.properties.ville) {
                html += '<small>' + result.properties.ville + '</small>';
            }
            
            html += '</div>';
        });

        container.innerHTML = html;
        container.classList.add('active');

        // Add click handlers to results
        container.querySelectorAll('.search-result-item').forEach(function(item) {
            item.addEventListener('click', this.handleResultClick.bind(this));
        }.bind(this));
    },

    hideResults: function(container) {
        container.classList.remove('active');
        container.innerHTML = '';
    },

    handleResultClick: function(e) {
        var item = e.currentTarget;
        var lat = parseFloat(item.getAttribute('data-lat'));
        var lng = parseFloat(item.getAttribute('data-lng'));
        var id = item.getAttribute('data-id');

        // Fly to location
        map.flyTo([lat, lng], 16);

        // Find and open the corresponding marker's popup
        if (FilterComponent.poiLayers[id] && FilterComponent.poiLayers[id].marker) {
            FilterComponent.poiLayers[id].marker.openPopup();
        }

        // Hide results
        this.hideResults(item.parentElement);

        // Clear input
        item.closest('.search-container').querySelector('input').value = '';
    }
};

// Export for global use
window.SearchComponent = SearchComponent;