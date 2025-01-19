// CUSTOMIZED CONSTANTS
const title = "Acteurs de l'accompagnement et du financement de l'entrepreneuriat à impact en Bretagne"
const hint_title = "Conseils"
const hint_content = "Le menu gauche permet la sélection des différents élements." +
                    "<br><br>" +
                    "Vous pouvez effectuer une recherche par acteur (ou par ville) en cliquant sur la loupe, et en tapant le nom recherché"

// Call our update functions first
updateTitle();
updateHintTitle();
updateHintContent();

// Initialize Foundation
$(document).foundation();

// Initialize off-canvas functionality
$(document).ready(function() {
    new Foundation.OffCanvas($('#filter-offcanvas'));

    // Handle search input
    $('.input-group-field').on('input', function() {
        const searchValue = $(this).val().toLowerCase();
        // Use the existing FuseSearch functionality
        searchCtrl.searchFeatures(searchValue);
    });

    // Handle map resize when off-canvas is opened/closed
    $('#filter-offcanvas').on('opened.zf.offCanvas', function() {
        if (typeof map !== 'undefined') {
            setTimeout(() => map.invalidateSize(), 300);
        }
    }).on('closed.zf.offCanvas', function() {
        if (typeof map !== 'undefined') {
            setTimeout(() => map.invalidateSize(), 300);
        }
    });

    // Sync filters after DOM is loaded
    syncFilters();
});

// FUNCTIONS
function updateTitle() {
    const titleElements = document.querySelectorAll('[data-js-fill-id="map_title"]');
    if (titleElements) {
        titleElements.forEach(element => {
            element.textContent = title;
        });
    }
}

function updateHintTitle() {
    const hintTitleElement = document.getElementById('hint_title');
    if (hintTitleElement) {
        hintTitleElement.textContent = hint_title;
    }
}

function updateHintContent() {
    const hintContentElement = document.getElementById('hint_content');
    if (hintContentElement) {
        hintContentElement.innerHTML = hint_content;
    }
}

// Function to sync filter selections between desktop and mobile
function syncFilters() {
    // Sync first filter group
    const desktopList = document.getElementById('select-list');
    const mobileList = document.getElementById('select-list-mobile');
    if (desktopList && mobileList) {
        mobileList.innerHTML = desktopList.innerHTML;
    }

    // Sync second filter group
    const desktopList2 = document.getElementById('select-list2');
    const mobileList2 = document.getElementById('select-list2-mobile');
    if (desktopList2 && mobileList2) {
        mobileList2.innerHTML = desktopList2.innerHTML;
    }

    // Add event listeners to keep checkboxes in sync
    document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const correspondingId = this.id;
            const otherCheckboxes = document.querySelectorAll(`input[id="${correspondingId}"]`);
            otherCheckboxes.forEach(otherCheckbox => {
                if (otherCheckbox !== this) {
                    otherCheckbox.checked = this.checked;
                }
            });
            // Trigger the existing display update function
            onDisplayCheckBoxChanged(this.id, getCategorie(this.id));
        });
    });
}
