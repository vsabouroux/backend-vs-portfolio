const express = require("express");
const router = express.Router(); // méthode Router d'express
//"/api/projects" = route de base url de base donc on va le remplacer par /
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const projectsCtrl = require("../controllers/projects");

router.get("/:id", projectsCtrl.getOneProject);
router.get("/", projectsCtrl.getAllProjects);
router.post("/", auth, multer, projectsCtrl.createProject);
router.put("/:id", auth, multer, projectsCtrl.modifyProject);
router.delete("/:id", auth, projectsCtrl.deleteProject);


module.exports = router;



