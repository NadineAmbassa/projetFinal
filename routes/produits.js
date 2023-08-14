const express = require("express");
const nodeJSpath = require("path");
const fs = require("fs");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const Usagers = require("../models/usagers");
const mongoose = require("mongoose");
const multer = require("multer");
const upload = multer();
const {
  estAuthentifie,
  estAdmin,
  estGestion,
  forwardAuthenticated,
} = require("../config/auth");

const Produits = require("../models/produits");
const { exec } = require("child_process");
const { stringify } = require("querystring");

const ObjectId = mongoose.Types.ObjectId;

// route pour tous le produit (sport+mode+.....)
router.get("/",  (req, res) => {
  Produits.find({}, null)
    .exec()
    .then((produits) => {
      res.render("listeProduits", {
        //titrePage: "Liste des produits Sports",
        user: req.user,
        products: produits,
        banner:
          "https://d1hmrg7j7rvat1.cloudfront.net/assets/images_accueil/left_col_promo-55bf6c9c6f82e1ed97f2236438bd969b.jpg",
        layout: "layout",
        bannerText: "Voici nos produits",
        categorie: "all"
      });
    })
    .catch((err) => console.log(err));
});

// route liste produit pour gestion
router.get("/gestion", estAuthentifie, (req, res) => {
  Produits.find({}, null)
    .exec()
    .then((produits) => {
      res.render("listeProduitsGestion", {
        //titrePage: "Liste des produits Sports",
        user: req.user,
        products: produits,
        banner:
          "https://d1hmrg7j7rvat1.cloudfront.net/assets/images_accueil/left_col_promo-55bf6c9c6f82e1ed97f2236438bd969b.jpg",
        layout: "layout",
        bannerText: "gestion des produits",
      });
    })
    .catch((err) => console.log(err));
});

// routes pour afficher details produit

router.get("/sport", (req, res) => {
  Produits.find({ categorie: { $in: ["sport"] } }, null)
    // Produits.find({ categorie: "sport" }, null)
    .exec()
    .then((produits) =>
      res.render("listeProduits", {
        user: req.user,
        products: produits,
        banner:
          "https://img.freepik.com/photos-gratuite/outils-sport_53876-138077.jpg?w=2000",
        bannerText: "Voici nos articles de sport",
        categorie: "sport"
      })
    );
});

router.get("/mode", (req, res) => {
  Produits.find({ categorie: "mode" }, null)
    .exec()
    .then((produits) =>
      res.render("listeProduits", {
        user: req.user,
        products: produits,
        banner:
          "https://assets-global.website-files.com/631e047ded5805d36bbd2efd/63233456a972a7c3fd349b0b_63220d2b8120db3bd6705cff_a3f35407-c86e-4f91-be21-59c6d305aad0_magasin_vetement.png",
        bannerText: "Voici nos articles de mode",
        categorie: "mode"
      })
    );
});

router.get("/maison", (req, res) => {
  Produits.find({ categorie: "maison" }, null)
    .exec()
    .then((produits) =>
      res.render("listeProduits", {
        user: req.user,
        products: produits,
        banner:
          "https://cuisinebroder.com/wp-content/uploads/2022/10/Projet-Nebbiolo-3-Broder-V2-scaled.jpg",
        bannerText: "Voici nos articles de maison et cuisine",
        categorie: "maison"
      })
    );
});

router.get("/sante", (req, res) => {
  Produits.find({ categorie: "sante" }, null)
    .exec()
    .then((produits) =>
      res.render("listeProduits", {
        user: req.user,
        products: produits,
        banner:
          "https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/04/makeup_composition_overhead-1296x728-header.jpg?w=1155&h=1528",
        bannerText: "Voici nos articles de santé et beauté",
        categorie: "sante"
      })
    );
});

router.get("/electronique", (req, res) => {
  Produits.find({ categorie: "electronique" }, null)
    .exec()
    .then((produits) =>
      res.render("listeProduits", {
        user: req.user,
        products: produits,
        banner:
          "https://iutv.univ-paris13.fr/wp-content/uploads/2015/11/electronique-page.jpg",
        bannerText: "Voici nos articles électronique",
        categorie: "electronique"
      })
    );
});

// route pour supprimer un produit
router.get("/supprimer/:_idProduit", estGestion, (req, res) => {
  Produits.deleteOne({ _id: req.params._idProduit })
    .then((produit) => res.redirect('/produits'))
    .catch((err) => console.log(err));
});


router.post("/resultatSearch", (req, res) => {
  const keyWord = req.body.key;
  const regex = new RegExp(keyWord, "i");

  Produits.find({
    $or: [
      { nom: { $regex: regex } },
      { description: { $regex: regex } }
    ]
  })
    .then((produits) => {
      console.log("Search result: ", produits);
      res.render("resultatSearch", {
        bannerText: "Résultat de recherche:",
        products: produits,
        banner: "https://d1hmrg7j7rvat1.cloudfront.net/assets/images_accueil/left_col_promo-55bf6c9c6f82e1ed97f2236438bd969b.jpg",
        user: req.body.user
      });
    })
    .catch((error) => {
      console.error("Error performing search: ", error);
      res.status(500).send("Internal Server Error");
    });
});






//////////// Editer ou modifier un produit////////////
// route pour modifier un usagers

router.get("/editer/:_idProduit", (requete, reponse) => {
  console.log("requete.params._idProduit", requete.params._idProduit);
  Produits.findOne({ _id: requete.params._idProduit })
    .then((produit) => {
      console.log("Produit récupéré pour editer :", produit);
      reponse.render("editerProduit", {
        produit: produit,
        title: "modifier un Produits",
        user: requete.user,
        //layout: false,
      });
    })
    .catch((err) => console.log(err));
});

router.post("/editer/:_idProduit", upload.none(), (requete, reponse) => {
  const idProduit = requete.params._idProduit;

  const {
    nom,
    prix,
    description,
    quantiter,
    image,
    categorie
  } = requete.body;
  console.log(
    " je suis dans route POST editer : requete.body.nom",
    requete.body.nom
  );
  let errors = [];


  if (errors.length > 0) {
    errors.push({ msg: "inconnu, revenir a route/post/editer " });
  } else {
    Produits.findOne({ _id: idProduit }).then((produit) => {
      if (produit) {
        // Mis à jour de produit
        produit.nom = nom;
        produit.prix = prix;
        produit.description = description;
        produit.quantiter = quantiter;
        produit.image = image;
        produit.categorie = categorie;

        produit
          .save()
          .then((produit) => {
            requete.flash("success_msg", "Produit mis à jour dans la BD!");
            reponse.redirect("/Produits");
          })
          .catch((err) => console.log(err));
      } else {
        errors.push({ msg: "Aucun Produit trouvé avec cet identifiant" });
      }
    });
  }
});

////////////////
//// route get pour ajouter un produit
router.get("/ajouter", (req, res) =>
  res.render("ajouterProduit", {
    title: "Ajout un produit",
    user: req.user,
    //layout: false,
  })
);

// route post pour ajout de produit
router.post("/ajouter", upload.none(), (req, res) => {
  const { nom, prix, description, quantiter, image, categorie } = req.body;
  console.log("retour: ", req.body);

  let errors = [];

  if (!nom || !prix || !description || !image || !quantiter) {
    errors.push({
      msg: "Veuillez remplir toutes les cases du formulaire",
    });
  }

  if (errors.length > 0) {
    //supprimerFichier(path);
    res.render("ajouterProduit", {
      layout: false,
      errors,
      title: "Ajouter un produit",
      nom,
      prix,
      description,
      quantiter,
      categorie,

      image,
    });
  } else {
    Produits.findOne({ nom: nom }).then((produit) => {
      if (produit) {
        //supprimerFichier(path);
        errors.push({ msg: "Ce produit existe déjà" });
        res.render("ajouterProduit", {
          errors,
          title: "Ajout d'un Produit",
          nom,
          prix,
          description,
          quantiter,
          image,
          categorie
        });
      } else {
        const newProduit = new Produits({
          user: req.user,
          layout: false,
          _id: new mongoose.Types.ObjectId(),
          nom,
          prix,
          description,
          quantiter,
          image,
          categorie,
        });
        console.log("voici le produit à mettre en BD", newProduit);

        newProduit
          .save()
          .then((produit) => {
            req.flash("success_msg", "Produit inscrit à la BD!");
            res.redirect("/");
          })
          .catch((err) => console.log(err));
      }
    });
  }
});


//filters

router.post("/filtre", (req,res) => {
  const {filtre, banner, bannerText} = req.body

  let categorie = req.body.categorie;
  categorie = categorie.trim()

  if(categorie == "all"){
    categorie = ""
  }

  console.log(req.body);

  if(filtre == "AtoZ"){
    if(categorie == ""){
      Produits.find({},null, {sort: {nom : 1}})
      .then((produits) => {
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: "all"
        })
      })
    }else{
      Produits.find({categorie: categorie},null, {sort: {nom : 1}})
      .then((produits) => {
        console.log(produits)
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: categorie
        })
      })
    }
  }else if(filtre == "ZtoA"){
    if(categorie == ""){
      Produits.find({},null, {sort: {nom : -1}})
      .then((produits) => {
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: "all"
        })
      })
    }else{
      Produits.find({categorie: categorie},null, {sort: {nom : -1}})
      .then((produits) => {
        console.log(produits)
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: categorie
        })
      })
    }
  }else if(filtre == "numberCroissant"){
    if(categorie == ""){
      Produits.find({},null, {sort: {prix : 1}})
      .then((produits) => {
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: "all"
        })
      })
    }else{
      Produits.find({categorie: categorie},null, {sort: {prix : 1}})
      .then((produits) => {
        console.log(produits)
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: categorie
        })
      })
    }
  }else if(filtre == "numberDecroissant"){
    if(categorie == ""){
      Produits.find({},null, {sort: {prix : -1}})
      .then((produits) => {
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: "all"
        })
      })
    }else{
      console.log('dans else')
      Produits.find({categorie: categorie},null, {sort: {prix : -1}})
      .then((produits) => {
        console.log(produits)
        res.render("listeProduits", {
          user: req.user,
          products: produits,
          banner: banner,
          bannerText: bannerText,
          categorie: categorie
        })
      })
    }
  }else{
    
  }
})



const produitsConnexe = async (categorie) => {
  const produits = await Produits.find({ categorie: categorie }, null);
  const listeProduits = [];

  // Shuffle the array to get random products
  produits.sort(() => Math.random() - 0.5);

  for (let i = 0; i < 3; i++) {
    if (i < produits.length) {
      listeProduits.push(produits[i]);
    }
  }

  return listeProduits;
};

router.get("/detailsProduit/:_idProduit", (req, res) => {
  const idProduit = req.params._idProduit;

  if (ObjectId.isValid(idProduit)) {
    const objectId = new ObjectId(idProduit);

    console.log("object:", objectId);

    Produits.findOne({ _id: objectId })
      .then((produit) => {
        console.log("Produit récupéré :", produit);
        if (produit) {
          produitsConnexe(produit.categorie[0]).then((produitCategorie) => {
            res.render("detailsProduit", {
              user: req.user,
              title: "Détails du produit",
              products: produit,
              produitsConnexe: produitCategorie,
            });
          });
        } else {
          console.log("Produit introuvable");
          res.status(404).send("Produit introuvable");
        }
      })
      .catch((err) => console.log(err));
  } else {
    console.log("Identifiant de produit invalide");
    res.status(400).send("Identifiant de produit invalide");
  }
});



module.exports = router;