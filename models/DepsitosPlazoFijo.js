const mongoose = require('mongoose')

const Depsito = mongoose.Schema({
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
    tipoCuenta: {
        type: String,
        required: true,
    },
    fechaDeposito:{
        type: Date,
        required: true,
    },
    PlazoDelDepisto:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'AhorrosPlazosFijos',
    },
    MonedaDelDeposito:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'TipoModena',
    },
    MontoDelDeposito:{
        type:Number,
        required:true,
    }
})
module.exports = mongoose.model('Deposito', Depsito);