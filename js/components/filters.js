var FilterComponent = {
    categories: {},                   // Categories and their subcategories
    selectedSubCategories: new Set(), // Currently selected subcategories
    currentCategory: null,           // Currently displayed category
    poiLayers: new Array(),         // Store map markers/features
    selectAllBtn: null,
    unselectAllBtn: null,

    sanitizeId: function(string) {
        return string.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    },

    initialize: function() {
        // First clear any existing markers
        markers.clearLayers();
        map.removeLayer(markers);
        
        // Process data and setup UI
        this.processFeatures();
        this.createFilterLists();
        this.setupEventListeners();
    },

    // Data Processing Methods
    processFeatures: function() {
        if (!mapPOIs || !mapPOIs.features) return;

        mapPOIs.features.forEach(feature => {
            const category = feature.properties.categorie;
            const subCategory = feature.properties.sous_cat;

            // Process categories and subcategories
            if (category) {
                if (!this.categories[category]) {
                    this.categories[category] = new Set();
                }
                if (subCategory) {
                    this.categories[category].add(subCategory);
                }
            }

            // Layer creation
            this.poiLayers[feature.properties.id] = {
                "feature": feature,
                "marker": MapComponent.createMarker(
                    feature, 
                    L.latLng(feature.geometry.coordinates[1], 
                            feature.geometry.coordinates[0])
                )
            };

            // Create and bind popup
            if (typeof(this.poiLayers[feature.properties.id].marker) != "undefined") {
                var popupContent = PopupComponent.createContent(feature);
                this.poiLayers[feature.properties.id].marker.bindPopup(
                    popupContent,
                    siteConfig.popup.options
                );
                
                PopupComponent.setupEvents(feature, 
                    this.poiLayers[feature.properties.id].marker);
                markers.addLayer(this.poiLayers[feature.properties.id].marker);
            }
        });
    },

    // UI Methods
    createFilterLists: function() {
        // Create categories grid
        const categoriesContainer = document.querySelector('.categories-panel .grid-x');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = Object.keys(this.categories).map(category => `
                <div class="cell" data-category="${category}">
                    <div class="category-item">
                        <img src="images/icons/${mapConfig.formatIconName(category)}.png" 
                             alt="${category}" 
                             class="category-icon">
                        <span>${category}</span>
                    </div>
                </div>
            `).join('');
        }
    },

    setupEventListeners: function() {
        // Category clicks
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const category = e.currentTarget.closest('[data-category]').dataset.category;
                this.showSubCategories(category);
            });
        });

        // Back button
        const backBtn = document.querySelector('.back-to-categories');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showCategories());
        }

        // Select all button
        this.selectAllBtn = document.querySelector('.select-all-button');
        if (this.selectAllBtn) {
            this.selectAllBtn.addEventListener('click', () => this.selectAllSubCategories());
        }

        // Unselect all button
        this.unselectAllBtn = document.querySelector('.unselect-all-button');
        if (this.unselectAllBtn) {
            this.unselectAllBtn.addEventListener('click', () => this.removeAllSelected());
        }

        // Remove all selected
        const removeAllBtn = document.querySelector('.remove-all');
        if (removeAllBtn) {
            removeAllBtn.addEventListener('click', () => this.removeAllSelected());
        }

        // Mobile filter button
        const filterBtn = document.querySelector('.filter-button');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.toggleMobileFilters());
        }

        // Search related
        const searchInputs = document.querySelectorAll('.search-container input');
        const regularSearch = document.querySelector('[data-panel="regular-search"]');
        const focusedSearch = document.querySelector('[data-panel="focused-search"]');
        const categoriesPanel = document.querySelector('.categories-panel');

        searchInputs.forEach(input => {
            // Handle focus
            input.addEventListener('focus', () => {
                regularSearch.classList.add('hide');
                focusedSearch.classList.remove('hide');
                categoriesPanel.classList.add('hide');
                focusedSearch.querySelector('input').focus();
            });
            
            // Handle blur
            input.addEventListener('blur', (e) => {
                setTimeout(() => {
                    const stillInSearch = document.activeElement.closest('.search-container') || document.activeElement.closest('.search-results');
                
                    if (!stillInSearch) {
                        focusedSearch.classList.add('hide');
                        regularSearch.classList.remove('hide');
                        categoriesPanel.classList.remove('hide')
                    }
                }, 100);
            });
        });
    },

    showCategories: function() {
        document.querySelector('.logo-search-panel').classList.remove('hide');
        document.querySelector('.categories-panel').classList.remove('hide');
        document.querySelector('.subcategories-panel').classList.add('hide');
    },

    showSubCategories: function(category) {
        this.currentCategory = category;
        
        document.querySelector('.logo-search-panel').classList.add('hide');
        document.querySelector('.categories-panel').classList.add('hide');
        document.querySelector('.subcategories-panel').classList.remove('hide');

        const container = document.querySelector('#subcategories-list');
        if (container) {
            container.innerHTML = Array.from(this.categories[category]).map(subCat => `
                <div class="cell subcategory-item" data-subcategory="${subCat}">
                    <div class="grid-x align-middle grid-padding-x">
                        <div class="cell shrink">
                            <img src="images/icons/${mapConfig.formatIconName(subCat)}.png" 
                                alt="${subCat}" 
                                class="subcategory-icon">
                        </div>
                        <div class="cell auto">
                            ${subCat}
                        </div>
                        <div class="cell shrink">
                            <div class="custom-checkbox">
                                <input type="checkbox"
                                    id="check_${this.sanitizeId(subCat)}"
                                    ${this.selectedSubCategories.has(subCat) ? 'checked' : ''}>
                                <label for="check_${this.sanitizeId(subCat)}"></label>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.subcategory-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const subCat = item.dataset.subcategory;
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    this.toggleSubCategory(subCat, checkbox.checked);
                });
            });
        }

        this.updateSelectedPanel();
        this.updateSelectionButtons();
    },

    toggleSubCategory: function(subCategory, selected) {
        if (selected) {
            this.selectedSubCategories.add(subCategory);
        } else {
            this.selectedSubCategories.delete(subCategory);
        }
        this.updateSelectedPanel();
        this.updateDisplay();
        this.updateSelectionButtons();
    },

    selectAllSubCategories: function() {
        if (!this.currentCategory) return;
        
        this.categories[this.currentCategory].forEach(subCat => {
            this.selectedSubCategories.add(subCat);
        });
        
        const checkboxes = document.querySelectorAll('#subcategories-list input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        this.updateSelectedPanel();
        this.updateDisplay();
        this.updateSelectionButtons();
    },

    removeAllSelected: function() {
        if (!this.currentCategory) return;
        
        this.categories[this.currentCategory].forEach(subCat => {
            this.selectedSubCategories.delete(subCat);
        });
        
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.updateSelectedPanel();
        this.updateDisplay();
        this.updateSelectionButtons();
    },

    // Update the "Select/Unselect all" buttons based on current selection
    updateSelectionButtons: function() {
        if (!this.currentCategory) return;
        
        // Get count of all possible subcategories for current category
        const totalSubcategories = this.categories[this.currentCategory].size;
        
        // Count how many of those are currently selected
        let selectedCount = 0;
        this.categories[this.currentCategory].forEach(subCat => {
            if (this.selectedSubCategories.has(subCat)) {
                selectedCount++;
            }
        });
        
        // If all subcategories are selected, show "Unselect all" button
        if (selectedCount === totalSubcategories) {
            this.selectAllBtn.classList.add('hide');
            this.unselectAllBtn.classList.remove('hide');
        } 
        // If no subcategories are selected, show "Select all" button
        else {
            this.unselectAllBtn.classList.add('hide');
            this.selectAllBtn.classList.remove('hide');
        }
    },

    // Update the selected subcategories panel
    updateSelectedPanel: function() {
        const panel = document.querySelector('.selected-subcategories-panel');
        const container = document.querySelector('#selected-subcategories-list');
        if (!container || !panel) return;

        // Show/hide panel based on selection
        if (this.selectedSubCategories.size > 0) {
            panel.classList.remove('hide');
        } else {
            panel.classList.add('hide');
        }

        container.innerHTML = Array.from(this.selectedSubCategories).map(subCat => `
            <div class="cell shrink">
                <div class="selected-subcategory" data-subcategory="${subCat}">
                    <img src="images/icons/${mapConfig.formatIconName(subCat)}.png" 
                         alt="${subCat}">
                    <button class="remove-subcategory" data-subcategory="${subCat}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.remove-subcategory').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subCat = e.currentTarget.dataset.subcategory;
                this.toggleSubCategory(subCat, false);
                const checkbox = document.querySelector(`#check_${this.sanitizeId(subCat)}`);
                if (checkbox) {
                    checkbox.checked = false;
                }
            });
        });
    },

    // Update the map display based on selected subcategories
    updateDisplay: function() {
        map.removeLayer(markers);
        markers.clearLayers();

        for (var idLayer in this.poiLayers) {
            var currentLayer = this.poiLayers[idLayer];
            if (this.isLayerVisible(currentLayer)) {
                markers.addLayer(currentLayer.marker);
            }
        }
        
        map.addLayer(markers);
    },

    // Check if a layer (map markers) should be visible based on selected subcategories
    isLayerVisible: function(layer) {
        const subCategory = layer.feature.properties.sous_cat;
        return this.selectedSubCategories.has(subCategory);
    },

    // Mobile Methods
    toggleMobileFilters: function() {
        const header = document.querySelector('.mobile-header');
        const filterBtn = document.querySelector('.filter-button');
        const panel = document.querySelector('#mobile-filter-panel');

        if (panel.classList.contains('is-open')) {
            panel.classList.remove('is-open');
            header.classList.remove('hide');
            filterBtn.classList.remove('hide');
        } else {
            panel.classList.add('is-open');
            header.classList.add('hide');
            filterBtn.classList.add('hide');
        }
    }
};

// Export for global use
window.FilterComponent = FilterComponent;