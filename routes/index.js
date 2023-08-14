const express = require('express');
const nodeJSpath = require('path');
const fs = require('fs');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Usagers = require('../models/usagers');
const Produits = require('../models/produits')
const mongoose = require('mongoose');
const { estAuthentifie, estAdmin, forwardAuthenticated } = require('../config/auth');


router.get('/', (req,res) => {
    Produits.find({ }, null, {sort: {prix: 1}}).exec()
        .then((produits) => res.render('pageMenu', {
            user: req.user,
            produits: produits,
        }));
});

module.exports= router;
