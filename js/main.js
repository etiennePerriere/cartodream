function initialize() {
    // Initialize components in the correct order
    UIComponent.initialize();
    MapComponent.initialize();
    FilterComponent.initialize();
    SearchComponent.initialize();

    // Add resize handler for off-canvas
    $('[data-off-canvas]').on('opened.zf.offCanvas closed.zf.offCanvas', function() {
        // Trigger map resize when off-canvas opens/closes
        if (map) {
            setTimeout(function() {map.invalidateSize();}, 300);
        }
    });
}

// Export initialize for global use
window.initialize = initialize;