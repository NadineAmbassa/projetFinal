const express = require('express');
const nodeJSpath = require('path');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Usagers = require('../models/usagers');
const Conversation = require('../models/chat');
const Produit = require('../models/produits')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { estAuthentifie, estAdmin, forwardAuthenticated } = require('../config/auth');

/**
 * Se connecter à la page Web
 * Voici les routes
 */
router.get('/login', (req, res) => {
    res.render('login', {
        layout: false
    });
});
router.post('/login', (req,res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usagers/login',
        failureFlash: true
    })(req,res,next);
})

/**
 * Se déconnecter quand on est connecter
 * Voici la route
 */
router.get('/logout', estAuthentifie, (req,res) => {
    req.logOut(((err) => {
        if(err){
            return next(err);
        }
        req.flash('success_msg', 'Vous êtes déconnecté');
        res.redirect('/usagers/login')
    }))
})

/**
 * S'inscrire au site Web
 * Voici les routes
 */
router.get('/register', (req, res) => {
    res.render('register', {
        layout: false
    });
});
router.post('/register', (req, res) => {
    const { nom, courriel, password, password2 } = req.body;
    let errors = [];

    if (!nom || !courriel || !password || !password2) {
        errors.push({ msg: "Remplir tous les cases du formulaire" });
    }

    if (password !== password2) {
        errors.push({ msg: "Les mots de passe ne correspondent pas" });
    }

    if (password.length < 4) {
        errors.push({ msg: "Le mot de passe doit avoir au moin 4 caractères" })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            nom,
            courriel,
            password,
            password2,
            layout: false
        });
    } else {
        Usagers.findOne({ courriel: courriel })
            .then(user => {
                if (user) {
                    errors.push({ msg: "Ce courriel existe deja",courriel })
                    res.render('register', {
                        errors,
                        nom,
                        courriel,
                        password,
                        password2,
                        layout: false
                    })
                }else{
                    const newUser = new Usagers({
                        _id: new mongoose.Types.ObjectId(),
                        nom,courriel,password,role: ["client"], panier: []
                    });
                    console.log("Voici l'usager a mettre en BD", newUser);
                    bcrypt.genSalt(10,(err,salt) => {
                        bcrypt.hash(newUser.password,salt,(err,hash)=> {
                            if(err) throw err;
                            newUser.password = hash;
                            newUser.save()
                            .then(user => {
                                req.flash('success_msg',"Usager inscrit!");
                                res.redirect('/usagers/login');
                            })
                            .catch(err => {console.log(err)});
                        });
                    });
                }
            });
    }
});

/**
 * Menu des admin
 * Voici la route
 */
router.get('/admin', estAdmin, (req, res) => {
    res.render('menuAdmin', {
        title: 'Menu admin',
        user: req.user,
    });
});

/**
 * Liste des usagers
 * Voici la route
 */
router.get('/liste', estAdmin, (req, res) => {
    Usagers.find({}, null, {}).exec()
    .then((usagers) => res.render('listeUsagers', {
        title: 'Liste des usagers',
        usagers,
        user: req.user,
    }))
    .catch((err) => console.log(err));
});

/**
 * Ajout d'usagers
 * Voici les routes
 */
router.get('/ajouter', estAdmin, (req, res) => {
    res.render('ajouterUsagers', {
        layout: false,
    });
});
router.post('/ajouter', estAdmin, (req, res) => {
    const {courriel, nom, password, password2, admin, gestion} = req.body;
    let errors = [];
    let roles = ['client'];
    if (admin === 'on') {
        roles.push('admin');
    }
    if (gestion === 'on') {
        roles.push('gestion');
    }

    if (!nom || !courriel || !password || !password2) {
        errors.push({msg: 'Remplir toutes les cases du formulaires'});
    }
    if (password !== password2) {
        errors.push({msg: 'Les mots de passe ne correspondent pas'});
    }
    if (password.length < 4) {
        errors.push({msg: 'Le mot de passe doit contenir au moins 4 caractères'});
    }

    if (errors.length > 0) {
        res.render('ajouterUsagers', {
            errors,
            title: 'Ajouter des usagers',
            courriel,
            nom,
            admin,
            gestion,
            layout: false,
        });
    } else {
        Usagers.findOne({courriel: courriel})
        .then((user) => {
            if (user) {
                errors.push({msg: 'Ce courriel existe déjà'});
                res.render('ajouterUsagers', {
                    errors,
                    courriel,
                    nom,
                    admin,
                    gestion,
                    layout: false,
                });
            } else {
                const newUser = new Usagers({
                    _id: new mongoose.Types.ObjectId(),
                    courriel,
                    nom,
                    password,
                    role: roles,
                    panier: []
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then((user) => {
                            req.flash('success_msg', "L'usager a bien été ajouter à la base de donnée");
                            res.redirect('/usagers/liste');
                        })
                        .catch((err) => console.log(err));
                    })
                })
            }   
        })
    }
})

/**
 * Modification d'usagers
 * Voici les routes
 */
router.get('/modifier/:idUsagers', estAdmin, (req, res) => {
    Usagers.findById(req.params.idUsagers)
    .then((usager) => {
        res.render('modifierUsagers', {
            layout: false,
            usager,
            user: req.user,
        });
    })
    .catch((err) => console.log(err));
});
router.post('/modifier', (requete, reponse) => {
    const {courrielDepart, id, nom, courriel, admin, gestion} = requete.body;
    let errors = [];
    let roles = ['client'];
    if (admin === 'on') {
        roles.push('admin');
    }
    if (gestion === 'on') {
        roles.push('gestion');
    }
    if (!nom || !courriel) {
        errors.push({msg: 'Remplir toutes les cases du formulaires'});
    }
    if (errors.length > 0) {
        Usagers.findById(id)
        .then((usager) => {
            reponse.render('modifierUsagers', {
                layout: false,
                errors,
                usager,
                courriel,
                nom,
                admin,
                gestion
            });
        });
    } else {
        Usagers.findOne({courriel: courriel})
        .then((user) => {
            if (courriel != courrielDepart && user) {
                errors.push({msg: 'Ce courriel existe déjà'});
                Usagers.findById(id)
                .then((usager) => {
                    reponse.render('modifierUsagers', {
                        layout: false,
                        errors,
                        usager,
                        courriel,
                        nom,
                        admin,
                        gestion,
                    })
                });
            } else {
                Usagers.findByIdAndUpdate(id, {
                    courriel, 
                    nom,
                    role: roles
                }, { new: true })
                .then((user) => {
                    requete.flash('success_msg', 'L\'usager a été modifié avec succès');
                    reponse.redirect('/usagers/liste');
                })
                .catch((err) => console.log(err));
            }
        })
    }
});

/**
 * Suppression d'usagers
 * Voici la route
 */
router.get('/supprimer/:idUsagers', estAdmin, (requete, reponse) => {
    const idUsagers = requete.params.idUsagers;
    Usagers.findByIdAndDelete(idUsagers)
    .then(() => {
        requete.flash('success_msg', 'L\'usager a été supprimé avec succès!');
        reponse.redirect('/usagers/liste');
    })
    .catch((err) => console.log(err));
});

/**
 * Portail des admins pour voir leurs conversations
 * Voici la route
 */
router.get('/portail', estAdmin, (req, res) => {
    Conversation.find({}, null, {}).exec()
    .then((conversations) => {
        res.render('portail', {
            title: 'Portail administrateur',
            conversations,
            user: req.user,
        });
    })
    .catch((err) => console.log(err));
});

/**
 * Écran de chat pour conversation entre les admins et les clients
 * Voici la route
 */
router.get('/chat/:idConversation', estAuthentifie, (req, res) => {
    if (req.user.role.includes('admin')) {
        Conversation.findById(req.params.idConversation)
        .then((conversation) => {   
            Usagers.findById(req.params.idConversation)
            .then((usager) => {
                if (!usager) {
                    req.flash('error_msg', 'Cet usager n\'existe plus.');
                    res.redirect('/usagers/portail');
                } else {
                    res.render('chat', {
                      title: 'Chat',
                      conversation,
                      usager,
                      user: req.user,
                      userId: req.params.idConversation,
                    });
                }
            })
        })
        .catch((err) => console.log(err));
    } else {
        Conversation.findById(req.user)
          .then((conversation) => {
            if (!conversation) {
                res.render('chat', {
                    title: 'Chat',
                    conversation: null,
                    user: req.user,
                    userId: req.params.idConversation,
                });
                return;
            }
      
            res.render('chat', {
              title: 'Chat',
              conversation,
              user: req.user,
              userId: req.params.idConversation,
            });
          })
          .catch((err) => console.log(err));
    }

});

/**
 * Envoyer un message à partir de l'écran 'chat'
 * Voici la route
 */
router.post('/sendMessage', estAuthentifie, async (req, res) => {
    const { id, message } = req.body;
    
    if (!message) {
        res.redirect(`/usagers/chat/${id}`);
        return
    }
  
    try {
      let conversation = await Conversation.findById(id);
      let usagerClient = await Usagers.findById(id);
    
      if (req.user.role.includes('admin')) {
        if (conversation) {
            const newMessage = {
              _id: new mongoose.Types.ObjectId(),
              from: 'admin',
              to: usagerClient.courriel,
              message,
            };
      
            conversation.messages.push(newMessage);
            await conversation.save();
          } else {
            const newConversation = new Conversation({
              _id: id,
              messages: [
                {
                  _id: new mongoose.Types.ObjectId(),
                  from: 'admin',
                  to: usagerClient.courriel,
                  message,
                }
              ]
            });
      
            await newConversation.validate();
            await newConversation.save();
          }
      } else {
          if (conversation) {
            const newMessage = {
              _id: new mongoose.Types.ObjectId(),
              from: req.user.courriel,
              to: 'admin',
              message,
            };
      
            conversation.messages.push(newMessage);
            await conversation.save();
          } else {
            const newConversation = new Conversation({
              _id: id,
              messages: [
                {
                  _id: new mongoose.Types.ObjectId(),
                  from: req.user.courriel,
                  to: 'admin',
                  message,
                }
              ]
            });
      
            await newConversation.validate();
            await newConversation.save();
          }
      }  
      res.redirect(`/usagers/chat/${id}`);
    } catch (error) {
      console.log(error);
    }
});

/**
 * Suppression de conversations
 * Voici la route
 */
router.get('/supprimerConversation/:idConversation', (requete, reponse) => {
    const idConversation = requete.params.idConversation;
    Conversation.findByIdAndDelete(idConversation)
    .then(() => {
        requete.flash('success_msg', 'La conversation a été supprimé avec succès!');
        reponse.redirect('/usagers/portail');
    })
    .catch((err) => console.log(err));
});
router.get('/panier',estAuthentifie, (req,res) => {
    res.render('panierAchat',{
        user: req.user,
        produits: req.user.panier
    });
});

router.post('/deletePanier', estAuthentifie, (req,res) => {
    const idProduit = req.body.idProduit;

    if(ObjectId.isValid(idProduit)){
        const objectId = new ObjectId(idProduit);
        Usagers.updateOne({_id: req.user.id}, {$pull: {panier: {_id:objectId}}})
            .then(() => {
                console.log('success remove panier')
                req.flash('success_msg', "articles retirer du panier");
                res.redirect('/usagers/panier');
            })
            .catch((err) => {
                console.log("erreur de suppression", err);
                res.redirect('/usagers/panier')
            })
    }
})

router.post('/panier',estAuthentifie, (req,res) => {
    const idProduit = req.body.product;

    if(ObjectId.isValid(idProduit)){
        const objectId = new ObjectId(idProduit);
        Produit.findOne({_id: objectId})
            .then((produit) => {
                if(produit){
                    const updatedProduit = {
                        ...produit._doc,
                        quantiterVoulu : 1,
                        prixTotal : produit.prix
                    }
                    console.log("produit avec addition",updatedProduit);
                    Usagers.updateOne({_id: req.user._id}, {$push: {panier: updatedProduit}})
                        .then(() => {
                            req.flash('success_msg', "Article ajouter au panier")
                            res.redirect('/usagers/panier')
                        })
                        .catch((err) => {
                            console.log("erreur ajout", err);
                        })
                }
            })
    }
})

module.exports = router;