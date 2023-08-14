const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// charger le modèle pour la collection usagers
const Usagers = require('../models/usagers');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({usernameField: 'courriel'}, (courriel, password, done)=>{
            Usagers.findOne({courriel: courriel})
            .then((usager)=>{
                if (!usager) {
                    return done(null, false, {message: `Erreur usager!` })
                }
                console.log('usager de BD', usager);
                bcrypt.compare(password, usager.password, (err, isMatch)=>{
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, usager);
                    } else {
                        return done(null, false, {message: 'Mot de passe invalide'});
                    }
                });
            })
            .catch(err => console.log(err));
        })
    );
    passport.serializeUser(function(usager, done){
        done(null, usager.courriel);
    });
    passport.deserializeUser(function(courriel, done){
        Usagers.findOne({courriel: courriel})
        .then((usager)=> done(null, usager))
        .catch(err=> done(err, null));
    });
}