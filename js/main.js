function initialize() {
    // Initialize components in the correct order
    UIComponent.initialize();
    MapComponent.initialize();
    FilterComponent.initialize();
    SearchComponent.initialize();
}

// Export initialize for global use
window.initialize = initialize;