function initialize() {
    // Initialize map
    MapComponent.initialize();

    // Initialize filters and process features
    FilterComponent.initialize();

    // Initialize search
    SearchComponent.initialize();
}

// Export initialize for global use
window.initialize = initialize;