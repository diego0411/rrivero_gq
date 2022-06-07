const mongoose = require('mongoose');

const ClienteBancoSucursalSchema = mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cliente'
    },
    bancoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Banco'
    },
    sucursalId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Sucursal'
    },
    numeroCuenta: {
        type: Number,
        required: true,
        trim: true
    },
    saldoCuenta: {
        type: Number,
        required: true,
        trim: true
    },
    tipoCuenta: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('ClienteBancoSucursal', ClienteBancoSucursalSchema);