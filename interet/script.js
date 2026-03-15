const versementRetraitBtn = document.getElementById('versementRetraitBtn');
const tauxBtn = document.getElementById('tauxBtn');
const removeVersementRetraitBtn = document.getElementById('removeVersementRetraitBtn');
const RemoveTauxBtn = document.getElementById('removeTauxBtn');
let versementRetrait = document.getElementById('versementRetrait');
let taux = document.getElementById('taux');
let btnForm = document.getElementById('btnForm');
const form = document.querySelector("form");

const listeVersementRetrait = [];
const listeTaux = [];

// permet de calculer les intérêts sur une durée donnée en fonction du capital et du taux
function calculerInterets(capital, rate, numberOfQuinzaines) {
    return (capital * (numberOfQuinzaines * 15) * rate) / 36000;
}

// renvoie le nombre de quinzaine d'une date donnée
function getQuinzaine(date) {
    const mois = date.getMonth();
    const jourDuMois = date.getDate();
    let indiceQuinzaine = mois * 2;
    if (jourDuMois > 15) {
        indiceQuinzaine += 1;
    }
    return indiceQuinzaine;
}

// convertit une date en fonction du type
function convertirDate(date, typeVersementRetrait) {
    if (typeVersementRetrait === "versement") {
        if (date.getDate() <= 15) {
            date.setDate(16);
        } else {
            date.setDate(1);
            date.setMonth(date.getMonth() + 1);
        }
    } else {
        if (date.getDate() <= 15) {
            date.setDate(1);
        } else {
            date.setDate(16);
        }
    }
    return date;
}

function calculer(capitalInitial, dateInitial, tauxInitial, listeVersementRetrait, listeTaux) {
    capitalInitial = parseFloat(capitalInitial);
    tauxInitial = parseFloat(tauxInitial);
    let capital = capitalInitial;
    let dateActuelle = new Date(dateInitial);
    let tauxActuel = tauxInitial;
    let interetsTotal = 0;

    // je tri les événements par date pour les traiter dans l'ordre chronologique
    listeVersementRetrait.sort((premiereDate, deuxiemeDate) => new Date(premiereDate.date) - new Date(deuxiemeDate.date));
    listeTaux.sort((premiereDate, deuxiemeDate) => new Date(premiereDate.date) - new Date(deuxiemeDate.date));

    let evenements = [];
    listeVersementRetrait.forEach(evenementVersementRetrait => {
        evenements.push({type:"versementRetrait", ...evenementVersementRetrait});
    });

    listeTaux.forEach(evenementTaux => {
        evenements.push({type:"taux", ...evenementTaux});
    });

    evenements.sort((premiereDate, deuxiemeDate) => new Date(premiereDate.date) - new Date(deuxiemeDate.date));
    evenements.forEach(evenement => {
        // calcul des interets
        let dateEvenement = convertirDate(new Date(evenement.date), evenement.typeVersementRetrait);
        let nbQuinzaines = getQuinzaine(dateEvenement) - getQuinzaine(dateActuelle);

        if (nbQuinzaines > 0){
            interetsTotal += calculerInterets(capital, tauxActuel, nbQuinzaines);
        }

        dateActuelle = dateEvenement;

        if (evenement.type === "taux"){
            tauxActuel = evenement.taux;
        }

        if (evenement.type === "versementRetrait"){
            if (evenement.typeVersementRetrait === "versement"){
                capital += evenement.montant;
            } else {
                capital -= evenement.montant;
            }
        }
    });

    // on calcul le dernier interet
    const dateFinAnnee = new Date(dateActuelle.getFullYear(), 11, 30);
    const quinzainesFinales = getQuinzaine(dateFinAnnee) - getQuinzaine(dateActuelle) + 1;

    interetsTotal += calculerInterets(capital, tauxActuel, quinzainesFinales);

    return { interets: interetsTotal, capitalFinal: capital};
}

versementRetraitBtn.addEventListener('click', () => {
    versementRetrait.style.display = 'flex';
    // je crée une ligne avec une div (line-versement-retrait) et j'ajoute des champs pour les versements/retraits
    const lineVersementRetrait = document.createElement('div');
    lineVersementRetrait.classList.add('line-versement-retrait');
    lineVersementRetrait.innerHTML = `
        <input type="number" min="0" step="0.01" name="montantVersementRetrait" placeholder="Entrez le montant (€)" required>
        <input type="date" name="dateVersementRetrait" required>
        <select name="typeVersementRetrait" required>
            <option value="versement">Versement</option>
            <option value="retrait">Retrait</option>
        </select>
    `;
    versementRetrait.appendChild(lineVersementRetrait);
});

tauxBtn.addEventListener('click', () => {
    taux.style.display = 'flex';
    // idem pour les taux
    const lineTaux = document.createElement('div');
    lineTaux.classList.add('line-taux');
    lineTaux.innerHTML = `
        <input type="date" name="dateTaux" required>
        <input type="number" min="0" step="0.01" name="taux" placeholder="Entrez le nouveau taux (%)" required>
    `;
    taux.appendChild(lineTaux);
});

btnForm.addEventListener('click', (event) => {
    event.preventDefault();

    // je vérifie que tous les champs sont remplis 
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // là je fais mes calculs avec mes lignes et mes valeurs
    document.querySelectorAll('.line-versement-retrait').forEach(line => {
        const montant = parseFloat(line.querySelector('input[name="montantVersementRetrait"]').value);
        const date = line.querySelector('input[name="dateVersementRetrait"]').value;
        const type = line.querySelector('select[name="typeVersementRetrait"]').value;
        listeVersementRetrait.push({ montant, date, typeVersementRetrait: type });
    });

    document.querySelectorAll('.line-taux').forEach(line => {
        const date = line.querySelector('input[name="dateTaux"]').value;
        const taux = parseFloat(line.querySelector('input[name="taux"]').value);
        listeTaux.push({ date, taux });
    });

    const capitalInitial = document.querySelector('input[name="capitalInitial"]').value;
    const dateInitial = document.querySelector('input[name="dateInitial"]').value;
    const tauxInitial = document.querySelector('input[name="tauxInitial"]').value;
    const resultat = calculer(capitalInitial, dateInitial, tauxInitial, listeVersementRetrait, listeTaux);
    document.querySelector('.resultat').innerHTML = `
    <p><strong>Capital initial :</strong> ${capitalInitial} €</p>
    <p><strong>Capital final :</strong> ${resultat.capitalFinal.toFixed(2)} €</p>
    <p><strong>Intérêts gagnés :</strong> ${resultat.interets.toFixed(2)} €</p>
    <p><strong>Total final :</strong> ${(resultat.capitalFinal + resultat.interets).toFixed(2)} €</p>
    `;
    document.querySelector('.resultat').style.display = 'flex';
});

// puis là je gère le cas où on veut supprimer une ligne
removeVersementRetraitBtn.addEventListener("click", () => {
    const lignes = document.querySelectorAll(".line-versement-retrait");
    if (lignes.length > 0) {
        if (lignes.length = 1) {
            versementRetrait.style.display = 'none';
        }
        lignes[lignes.length - 1].remove();
    }
});

removeTauxBtn.addEventListener("click", () => {
    const lignes = document.querySelectorAll(".line-taux");
    if (lignes.length > 0) {
        if (lignes.length = 1) {
            taux.style.display = 'none';
        }
        lignes[lignes.length - 1].remove();
    }

});