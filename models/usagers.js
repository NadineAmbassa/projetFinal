const mongoose = require('mongoose'); 

let schemaUsagers = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    courriel: {
        type: String,
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Array,
        required: true,
        default: ['client']
    },
    panier: {
        type: Array,
        required: true
    }
});

let Usagers = module.exports = mongoose.model('usagers', schemaUsagers);