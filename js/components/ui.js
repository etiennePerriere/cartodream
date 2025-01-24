var UIComponent = {
    initialize: function() {
        this.updateTitle();
        this.updateHints();
        this.initializeOffCanvas();
        this.showInitialHints();
    },

    updateTitle: function() {
        var titleElements = document.querySelectorAll('[data-js-fill-id="map_title"]');
        if (titleElements) {
            titleElements.forEach(function(element) {
                element.textContent = siteConfig.site.title;
            });
        }
    },

    updateHints: function() {
        // Update hint title
        var hintTitleElement = document.getElementById('hint_title');
        if (hintTitleElement) {
            hintTitleElement.textContent = siteConfig.ui.help.title;
        }

        // Update hint content
        var hintContentElement = document.getElementById('hint_content');
        if (hintContentElement) {
            hintContentElement.innerHTML = siteConfig.ui.help.content;
        }
    },

    showInitialHints: function() {
        // Show hints modal on first visit
        if (!localStorage.getItem('hintsShown')) {
            $('#hints-modal').foundation('open');
            localStorage.setItem('hintsShown', 'true');
        }
    },

    initializeOffCanvas: function() {
        $(document).foundation();  // Initialize Foundation

        // Handle map resize when off-canvas state changes
        $('#filter-offcanvas').on('opened.zf.offCanvas closed.zf.offCanvas', function() {
            if (map) {
                setTimeout(function() {
                    map.invalidateSize();
                }, 300);
            }
        });
    }
};

// Export for global use
window.UIComponent = UIComponent;