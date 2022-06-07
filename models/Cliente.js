const mongoose = require('mongoose');

const ClienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    saldoActual: {
        type: Number,
        required: false,
        trim: true
    },
    tipo: {
        type: String,
        required: true,
    },
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }
})

module.exports = mongoose.model('Cliente', ClienteSchema);