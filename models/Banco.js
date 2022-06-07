const mongoose = require('mongoose')

const BancoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    }
})

module.exports = mongoose.model('Banco', BancoSchema)