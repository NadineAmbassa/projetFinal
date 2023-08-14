const mongoose = require("mongoose");

let schemaProduit = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantiter: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  categorie: {
    type: Array,
    required: true,
  },
});

let Produits = (module.exports = mongoose.model("produits", schemaProduit));
