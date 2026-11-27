// =============================================================
// NAVIGATION ENTRE LES VUES (sans recharger la page)
// -----------------------------------------------------------
// Principe :
// - Chaque "vue" est une <section class="vue"> dans le HTML.
// - Une seule vue a la classe "vue-active" à la fois (visible).
// - Chaque lien du menu porte un attribut data-view="..." qui
//   correspond à l'id de la vue à afficher au clic.
// =============================================================

// On récupère tous les liens qui doivent changer de vue
const liensNavigation = document.querySelectorAll("[data-view]");

// On récupère toutes les vues disponibles sur la page
const vues = document.querySelectorAll(".vue");

// Fonction qui affiche uniquement la vue demandée
function afficherVue(idVue) {
  vues.forEach((vue) => {
    vue.classList.toggle("vue-active", vue.id === idVue);
  });

  // On remonte en haut de la page à chaque changement de vue,
  // pour ne pas rester scrollé au milieu de l'ancienne vue.
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// On écoute le clic sur chaque lien de navigation
liensNavigation.forEach((lien) => {
  lien.addEventListener("click", (evenement) => {
    evenement.preventDefault(); // empêche le lien d'agir comme un vrai lien
    const idVue = lien.dataset.view;
    afficherVue(idVue);
  });
});


// =============================================================
// FORMULAIRE DE CONTACT
// -------------------------------------------------------------
// Le message est envoyé par e-mail grâce au service gratuit
// FormSubmit (formsubmit.co), sans quitter la page.
// IMPORTANT : à la toute première utilisation, FormSubmit envoie
// un e-mail d'activation à l'adresse ci-dessous : il faut cliquer
// sur le lien qu'il contient, sinon les messages n'arrivent pas.
// =============================================================

// Adresse qui reçoit les messages (modifiable ici)
const ADRESSE_RECEPTION = "raphael.cochelin1@gmail.com";
const URL_ENVOI = "https://formsubmit.co/ajax/" + ADRESSE_RECEPTION;

const formulaireContact = document.getElementById("formulaire-contact");
const statutContact = document.getElementById("contact-statut");

// Affiche un message sous le formulaire ("ok" = vert, "erreur" = rouge)
function afficherStatut(message, type) {
  statutContact.textContent = message;
  statutContact.className = "statut statut--" + type;
}

if (formulaireContact) {
  formulaireContact.addEventListener("submit", async (evenement) => {
    evenement.preventDefault(); // empêche le rechargement de la page

    const bouton = formulaireContact.querySelector("button[type='submit']");
    const donnees = new FormData(formulaireContact);

    // Ce qui est envoyé à FormSubmit (les champs qui commencent par "_" sont des réglages)
    const envoi = {
      email: donnees.get("email"),   // devient l'adresse de réponse du mail reçu
      sujet: donnees.get("sujet"),
      message: donnees.get("message"),
      _subject: "[Portfolio] " + donnees.get("sujet"), // objet du mail reçu
      _template: "table",
      _captcha: "false",
      _honey: donnees.get("_honey"),  // champ piège anti-spam
    };

    bouton.disabled = true;
    afficherStatut("Envoi en cours...", "ok");

    try {
      const reponse = await fetch(URL_ENVOI, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(envoi),
      });

      // On lit la réponse de FormSubmit (si elle n'est pas lisible, on continue avec un objet vide)
      let resultat = {};
      try {
        resultat = await reponse.json();
      } catch (erreurLecture) {
        // réponse non lisible : on garde l'objet vide
      }

      // Affichée dans la console du navigateur (F12) pour faciliter le diagnostic
      console.log("Réponse FormSubmit :", reponse.status, resultat);

      if (!reponse.ok || resultat.success === "false" || resultat.success === false) {
        throw new Error(resultat.message || "erreur " + reponse.status);
      }

      formulaireContact.reset();
      afficherStatut("Message envoyé, merci !", "ok");
    } catch (erreur) {
      console.error("Échec de l'envoi :", erreur);
      // On affiche la vraie raison de l'échec pour savoir quoi corriger
      afficherStatut(
        "L'envoi a échoué (" + erreur.message + "). Réessaie plus tard ou écris-moi directement à " +
          ADRESSE_RECEPTION + ".",
        "erreur"
      );
    } finally {
      bouton.disabled = false;
    }
  });
}