const btnForm = document.getElementById("btnForm");
const form = document.querySelector("form");
const formContainer = document.querySelector(".container-form");
const btnTableau = document.getElementById("btnTableau");
const tableau = document.getElementById("tableau");
const tabContainer = document.querySelector(".container-tab");

btnForm.addEventListener("click", (event) => {
    // je met preventDefault pour éviter que page se recharge et que le formulaire se soumette
    event.preventDefault();

   // je vérifie que tous les champs sont remplis 
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // je supprime les anciennes valeurs du tableau en récupérant le contenu du tableau (tbody)
    const tbody = document.getElementById("tbody");
    tbody.innerHTML = "";

    formContainer.style.display = "none";
    tableau.style.display = "table";
    btnTableau.style.display = "block";
    tabContainer.style.display = "flex";

    function calcul(typeRemboursement, typeMode) {
        let montant = parseFloat(form.montant.value);
        const taux = parseFloat(form.taux.value);
        const duree = parseFloat(form.duree.value);
        let totalInterets = 0;
        let totalAmortissements = 0;
        let totalAnnuites = 0;
        // je convertie la durée en mois/trimestres/semestres ou années en finction du type de remboursement
        switch (typeRemboursement) {
            case "mensuels":
                dureeConvert = duree * 12
                break;
            case "trimestriels":
                dureeConvert = duree * 4
                break;
            case "semestriels":
                dureeConvert = duree * 2
                break;
            case "annuels":
                dureeConvert = duree
                break;
            default:
                dureeConvert = duree
        }

        // je commence les calculs pour les amortissements et les annuités
        let montantRestantDebut = montant;
        let amortissements = montant / dureeConvert;
        let annuites = montant * ((taux / 100) / (1 - Math.pow(1 + (taux / 100), -dureeConvert)));
        for (i = 1; i <= dureeConvert; i++) {;
            let interets = montant * (taux / 100);
            totalInterets += interets;
            // calculs pour les amortissements constants :
            if (typeMode == "amortissements") {
                annuites = amortissements + interets;
                totalAnnuites += annuites;
                totalAmortissements += amortissements;
            }
            // calculs pour les annuités constantes :
            else {
                amortissements = annuites - interets;
                totalAnnuites += annuites;
                totalAmortissements += amortissements;
            }
            montant -= amortissements;

            // ajout de la ligne dans le tableau pour chaque période
            const ligne = document.createElement("tr");
            ligne.innerHTML = `
                <td>${i}</td>
                <td>${montantRestantDebut.toFixed(2)}</td>
                <td>${interets.toFixed(2)}</td>
                <td>${amortissements.toFixed(2)}</td>
                <td>${annuites.toFixed(2)}</td>
                <td>${montant.toFixed(2)}</td>
            `;
            tbody.appendChild(ligne);
            montantRestantDebut = montant;
        }

        // ajout de la ligne total à la fin du tableau
        const totalLigne = document.createElement("tr");
            totalLigne.innerHTML = `
                <td><strong>Total</strong></td>
                <td>/////////</td>
                <td>${totalInterets.toFixed(2)}</td>
                <td>${totalAmortissements.toFixed(2)}</td>
                <td>${totalAnnuites.toFixed(2)}</td>
                <td>/////////</td>
            `;
            tbody.appendChild(totalLigne);
    }

    const periodicite = form.periodicite.value;
    const mode = form.calcul.value;
    calcul(periodicite, mode);
});

// si je clique sur le bouton reset, je cache le tableau et le bouton reset et je réaffiche le formulaire
btnTableau.addEventListener("click", () => {
    tableau.style.display = "none";
    btnTableau.style.display = "none";
    formContainer.style.display = "flex";
    tabContainer.style.display = "none";
});