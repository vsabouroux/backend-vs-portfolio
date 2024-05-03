const express = require("express");
const router = express.Router();
const contactCtrl = require("../controllers/contact"); // On importe le contrôleur pour le formulaire de contact

router.post("/", contactCtrl.submitContactForm); // Route pour soumettre le formulaire de contact

module.exports = router;