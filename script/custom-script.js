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
    const titleElement = document.getElementById('map_title');
    if (titleElement) {
        titleElement.textContent = title;
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