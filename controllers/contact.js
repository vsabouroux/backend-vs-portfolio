const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
require("dotenv").config();
// console.log(process.env) // remove this after you've confirmed it is working

// Configuration du transporteur pour nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});
// console.log('EMAIL_USER:', process.env.EMAIL_USER);
// console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

exports.submitContactForm = async (req, res) => {
  try {
    const { firstname, lastname, email, request } = req.body;
    console.log(req.body);
    // Créer une nouvelle entrée dans la base de données
    const newContact = new Contact({ firstname, lastname, email, request });
    await newContact.save();

        // Envoyer un e-mail au propriétaire de l'application
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: 'Nouveau formulaire de contact',
          text: `Vous avez reçu une nouvelle demande de contact de ${firstname} ${lastname} (${email}). Message: ${request}`
        };
    
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.error("Erreur lors de l'envoi de l'e-mail:", error);
          } else {
            console.log("E-mail envoyé avec succès:", info.response);
          }
        });

        
        // Envoi de l'e-mail automatique de confirmation au formulaire de contact
        const confirmationMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Confirmation de réception de votre message',
          text: `Bonjour ${firstname},\n\nVotre message a bien été reçu. Nous vous remercions pour votre intérêt et vous répondrons dans les meilleurs délais.\n\nCordialement,\n V Sabouroux`
        };
        
        transporter.sendMail(confirmationMailOptions, function(error, info){
          if (error) {
            console.error("Erreur lors de l'envoi de l'e-mail de confirmation:", error);
          } else {
            console.log("E-mail de confirmation envoyé avec succès à:", email);
          }
        });

    res.status(201).json({ message: "Données enregistrées avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des données du formulaire de contact:", error);
    res.status(500).json({ message: "Une erreur s'est produite lors de l'enregistrement des données du formulaire de contact" });
  }
};