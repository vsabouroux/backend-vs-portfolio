const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");

exports.createProject = (req, res, next) => {
  let projectObjet = JSON.parse(req.body.projet); //project changé en "projet" parceque c'est comme ça que cela s'appelle dans le frontend !!!

  projectObjet.tags = projectObjet.tags.split(","); // "split" pour diviser la chaîne de caractères en tableau
  projectObjet.skills = projectObjet.skills.split(",");
  console.log(projectObjet);

  delete projectObjet._id;
  delete projectObjet._userId;
  const project = new Project({
    ...projectObjet,
    userId: req.auth.userId,
    imageUrl: `https://${req.get("host")}/images/${
      req.file.filename
    }`,//changement des ${req.protocol} en https
  });
  project
    .save()
    .then(() => {
      res.status(201).json({
        message: "Projet créé !",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
exports.getAllProjects = (req, res, next) => {
  Project.find()
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getOneProject = (req, res, next) => {
  Project.findOne({
    _id: req.params.id,
    // userId: req.auth.userId,
  })
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: "Projet non trouvé !" });
      }
      return res.status(200).json(project);
    })
    .catch((error) => {
      return res.status(400).json({ error });
    });
};

exports.modifyProject = (req, res, next) => {
  let projectData = req.body.projet; // Récupérez directement les données du projet depuis req.body
  // Vérifier si des données de projet sont fournies dans la requête

  if (!projectData) {
    return res
      .status(400)
      .json({ message: "Aucune donnée de projet fournie." });
  }

  // Analyser les données du projet pour déterminer quels champs doivent être mis à jour
  let updatedFields = {};
  try {
    updatedFields = JSON.parse(projectData);
  } catch (error) {
    return res
      .status(400)
      .json({
        error: "Les données de projet ne sont pas au format JSON valide.",
      });
  }
  // Vérifier si les tags et les skills sont fournis et les transformer en tableaux si nécessaire
  if (updatedFields.tags && typeof updatedFields.tags === 'string') {
    updatedFields.tags = updatedFields.tags.split(",");
  }
  if (updatedFields.skills && typeof updatedFields.skills === 'string') {
    updatedFields.skills = updatedFields.skills.split(",");
  }
  // Vérifier si un nouveau fichier a été téléchargé pour remplacer l'image existante
  if (req.file) {
    updatedFields.imageUrl = `https://${req.get("host")}/images/${
      req.file.filename
    }`;
    // Supprime l'image existante
    Project.findById(req.params.id)
      .then((project) => {
        if (!project) {
          return res.status(404).json({ message: "Projet non trouvé !" });
        }
        if (project.imageUrl) {
          const imagePath = path.join(
            __dirname,
            "../images/",
            project.imageUrl.split("/images/")[1]
          );
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(
                "Erreur lors de la suppression de l'image existante :",
                err
              );
            }
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche du projet :", error);
      });
  }

  // Mettre à jour le projet seulement avec les champs fournis dans la requête
  Project.findByIdAndUpdate(req.params.id, updatedFields, { new: true })
    .then((updatedProjet) => {
      if (!updatedProjet) {
        return res.status(404).json({ message: "Projet non trouvé !" });
      }
      res
        .status(200)
        .json({ message: "Projet modifié !", projet: updatedProjet });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteProject = (req, res, next) => {
  Project.findOne({ _id: req.params.id })
    .then((projet) => {
      if (!projet) {
        return res.status(404).json({ message: "Projet non trouvé !" });
      }
      // if (projet.userId !== req.auth.userId) {
      //   return res.status(401).json({ message: "Accès non autorisé !" });
      // }
      else {
        const filename = projet.imageUrl.split("images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Project.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Projet supprimé !" });
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
