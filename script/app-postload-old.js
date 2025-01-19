// CUSTOMIZED CONSTANTS
const title = "Acteurs de l'accompagnement et du financement de l'entrepreneuriat à impact en Bretagne"
const filter_title = "Filtres et légende"
const hint_title = "Conseils"
const hint_content = "Le menu gauche permet la sélection des différents élements." +
                    "<br><br>" +
                    "Vous pouvez effectuer une recherche par acteur (ou par ville) en cliquant sur la loupe, et en tapant le nom recherché"
const sponsors = [
    {
        src: "image2/bdt.jpg",
        width: "40%"
    },
    {
        src: "image2//rb.jpg",
        width: "30%"
    }
]


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

function updateFilterTitle() {
    const filterTitleElement = document.getElementById('filter_title');
    if (filterTitleElement) {
        filterTitleElement.textContent = filter_title;
    }
}

function updateSponsors() {
    const sponsorElement = document.getElementById('sponsors');

    if (sponsorElement) {
        sponsors.forEach(sponsor => {
            const img = document.createElement('img');
            // Loop through the object properties and dynamically set attributes
            for (let attribute in sponsor) {
              if (sponsor.hasOwnProperty(attribute)) {
                img.setAttribute(attribute, sponsor[attribute]);
              }
            }
      
            const centerTag = document.createElement('span');
            centerTag.appendChild(img);
            sponsorElement.appendChild(centerTag);
        });
    }
}


// CALLS
updateTitle();
updateHintTitle();
updateHintContent();
updateFilterTitle();
updateSponsors();


$(document).foundation({
    offcanvas : {
        // Sets method in which offcanvas opens.
        // [ move | overlap_single | overlap ]
        open_method: 'overlap', 
        // Should the menu close when a menu link is clicked?
        // [ true | false ]
        close_on_click : true
    },
    // définition des options pour les bulles d'aide
    joyride: {
        pre_ride_callback: function() { // avant l'affichage des bulles d'aide, on ouvre les menus gauche et droit
            $('.off-canvas-wrap').foundation('offcanvas', 'show', 'offcanvas-overlap');
        },
        post_ride_callback: function() { 
            onRideEnded();
        }
    }
})

/*if(! $.cookie('gmf-joyride'))*/
$(document).foundation('joyride', 'start');

$(".joyride-close-tip").click(function() {
    onRideEnded();
});
$('.off-canvas-wrap').foundation('offcanvas', 'show', 'offcanvas-overlap');
$('#modal-help-accueil').foundation('reveal', 'open');

