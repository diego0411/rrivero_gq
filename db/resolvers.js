const Usuario = require('../models/Usuario')
const Banco = require('../models/Banco')
const Sucursal = require('../models/Sucursal')
const Cliente = require('../models/Cliente')
const ClienteBancoSucursal = require('../models/ClienteBancoSucursal')
const Deposito = require('../models/DepsitosPlazoFijo')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config({path:'variables.env'})

function crearToken(usuario, firma, expiresIn){
    const { id, email, nombre, apellido } = usuario
    return jwt.sign({id, email, nombre, apellido}, firma, {expiresIn})
}

const resolvers = {

    Query: {

        //Usuario
        obtenerUsuarios: async () => {

            try {
                return await Usuario.find()
            } catch (error) {
                console.log(error)
            }
        },

        obtenerUsuario: (_, { token }) => {

            try{
                return jwt.verify(token, process.env.palabraSecreta)
            }catch (error) {
                console.log(error)
            }
        },

        //Banco
        obtenerBancos: async () => {

            try {
                const banco = await Banco.find()
                return banco
            } catch (error){
                console.log(error)
            }
        },

        //Sucursal
        obtenerSucursales: async () => {

            try {
                const sucursales = await Sucursal.find()
                return sucursales
            } catch (error){
                console.log(error)
            }
        },

        obtenerSucursalesByBanco: async (_, { bancoId }) => {

            try {
                const sucursales = await Sucursal.find( {bancoId} )
                return sucursales
            } catch (error) {
                console.log(error)
            }
        },

        obtenerSucursalesByNombreBanco: async (_, { nombreBanco }) => {

            const banco = await Banco.findOne({ nombre: nombreBanco })
            if(!banco) {
                throw new Error(`El banco ${nombreBanco} no existe`)
            }

            const { id } = banco
            const sucursales = await Sucursal.find({ bancoId: id })
            return sucursales
        },

        //Cliente
        obtenerClientes: async () => {

            try {
                return await Cliente.find()
            } catch (error) {
                console.log(error)
            }
        },

        obtenerClientesUsuario: async (_, {}, ctx) => {

            const usuarioId = ctx.usuario.id
            try {
                return await Cliente.find({usuarioId})
            } catch (error) {
                console.log(error)
            }
        },

        //Cliente_Banco_Sucursal (Cuenta)
        obtenerCuentas: async () => {

            try {
                return await ClienteBancoSucursal.find()
            } catch (error) {
                console.log(error)
            }
        },

        obtenerCuentasByUsuario: async (_, {}, ctx) => {

            let cuentas = []

            const usuarioId = ctx.usuario.id

            const clientes = await Cliente.find({usuarioId})

            for(const c of clientes) {
                const clienteId = c.id
                const cuenta = await ClienteBancoSucursal.find({clienteId})

                for (const c of cuenta) {
                    cuentas.push(c)
                }
            }

            return cuentas
        },

        obtenerCuentasByCliente: async (_, {id}, ctx) => {

            const usuarioId = ctx.usuario.id

            const cliente = await Cliente.findById(id)
            if(!cliente) {
                throw new  Error(`El Cliente con Id ${id} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El Cliente con Id ${id} no es cliente del usuario con id ${usuarioId}.`)
            }

            try {
                return await ClienteBancoSucursal.find( {clienteId:id} )
            } catch (error) {
                console.log(error)
            }
        }

    },

    Mutation: {

        //Usuario
        nuevoUsuario: async (_, { input }) => {

            const { email, password } = input

            const usuario = await Usuario.findOne( { email })
            if(usuario){
                throw new Error(`El usuario con e-mail ${email} ya fue registrado`)
            }

            const salt = await bcryptjs.genSaltSync(10)
            input.password = await bcryptjs.hash(password, salt)

            const nuevoUsuario = new Usuario(input)

            try{
                await nuevoUsuario.save()
                return nuevoUsuario
            }catch (error){
                console.log(error)
            }
        },

        autenticarUsuario: async (_, { input }) => {

            const { email, password } = input

            const usuario = await Usuario.findOne({email})
            if (!usuario){
                throw new Error(`El usuario con e-mail ${email} no existe.`)
            }

            const passwordCorrecto = await bcryptjs.compare(password, usuario.password)
            if (!passwordCorrecto){
                throw new Error(`El password es incorrecto.`)
            }

            return { token:crearToken(usuario, process.env.palabraSecreta, 300000) }
        },

        autenticarUsuarios: async (_, { input }) => {

            let tokens = []

            for(const i of input)
            {
                const { email, password } = i

                const usuario = await Usuario.findOne({email})
                if (!usuario){
                    throw new Error(`El usuario con e-mail ${email} no existe.`)
                }

                const passwordCorrecto = await bcryptjs.compare(password, usuario.password)
                if (!passwordCorrecto){
                    throw new Error(`El password es incorrecto.`)
                }

                tokens.push({token:crearToken(usuario, process.env.palabraSecreta, 300000)})
            }

            return tokens
        },

        //Banco
        nuevoBanco: async (_, { input }) => {

            const { nombre } = input

            const banco = await Banco.findOne({ nombre })
            if(banco){
                throw new Error(`El banco con nombre ${nombre} ya existe`)
            }

            const nuevoBanco = new Banco(input)

            try{
                await nuevoBanco.save()
                return nuevoBanco
            }catch (error){
                console.log(error)
            }
        },

        modificarBanco: async (_, { id, input }) => {

            const { nombre } = input

            let banco = await Banco.findById(id)
            if(!banco) {
                throw new Error(`El banco con id ${id} no existe`)
            }

            banco = await Banco.findOne({ nombre })
            if(banco && id != banco.id) {
                throw new Error(`Ya existe un banco con el nombre ${nombre}`)
            }

            banco = await Banco.findByIdAndUpdate(id, input, {new:true})
            return banco
        },

        eliminarBanco: async (_,{ id }) => {

            const banco = Banco.findById(id)
            if(!banco){
                throw new Error(`El banco con id ${id} no existe.`)
            }

            await Banco.findByIdAndDelete(id)
            return "El registro fue eliminado!"
        },

        //Sucursal
        nuevaSucursal: async (_, { input }) => {

            const { nombre, direccion, bancoId } = input

            const banco = await Banco.findById(bancoId)
            if(!banco) {
                throw new Error(`El banco con id ${bancoId} no existe.`)
            }

            let sucursal = await Sucursal.findOne({ direccion })
            if(sucursal){
                throw new Error(`Ya existe una sucursal en ${direccion}.`)
            }

            sucursal = await Sucursal.findOne({ nombre, bancoId })
            if(sucursal) {
                throw new Error(`La sucursal ${nombre} ya existe.`)
            }

            const nuevaSucursal = new Sucursal(input)

            try{
                await nuevaSucursal.save()
                return nuevaSucursal
            }catch (error){
                console.log(error)
            }
        },

        modificarSucursal: async (_, { id, input }) => {

            const { nombre, direccion, bancoId } = input

            const banco = await Banco.findById(bancoId)
            if(!banco) {
                throw new Error(`El banco con id ${bancoId} no existe.`)
            }

            let sucursal = await Sucursal.findById(id)
            if(!sucursal) {
                throw new Error(`La sucursal con id ${id} no existe.`)
            }

            sucursal = await Sucursal.findOne({ direccion })
            if(sucursal && id !== sucursal.id){
                throw new Error(`Ya existe una sucursal en ${direccion}.`)
            }

            sucursal = await Sucursal.findOne({ nombre, bancoId })
            if(sucursal && id !== sucursal.id){
                throw new Error(`La sucursal ${nombre} ya existe.`)
            }

            sucursal = await Sucursal.findByIdAndUpdate(id, input, {new:true})
            return sucursal
        },

        eliminarSucursal: async (_, { id, bancoId}) => {

            const banco = await Banco.findById(bancoId)
            if(!banco) {
                throw new Error(`El banco con id ${bancoId} no existe.`)
            }

            const sucursal = await Sucursal.findById(id)
            if(!sucursal) {
                throw new Error(`La sucursal con id ${id} no existe.`)
            }

            if(banco.id != sucursal.bancoId) {
                throw new Error(`La sucursal con id ${id} no pertenece al banco con id ${bancoId}.`)
            }

            await Sucursal.findByIdAndDelete(id)
            return "El registro fue eliminado!"
        },

        //Cliente
        nuevoCliente: async (_, {input}, ctx) => {

            const usuarioId = ctx.usuario.id

            const { nombre, direccion, telefono, tipo } = input

            let nuevoCliente = new Cliente(input)

            nuevoCliente.usuarioId = usuarioId
            nuevoCliente.saldoActual = 0

            try {
                return await nuevoCliente.save()
            } catch (error){
                console.log(error)
            }
        },

        modificarCliente: async (_, { id, input }, ctx) => {

            const usuarioId = ctx.usuario.id

            const { nombre, direccion, telefono, tipo } = input

            let cliente = await Cliente.findById(id)
            if(!cliente) {
                throw new  Error(`El Cliente con el Id ${id} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El usuario con id ${usuarioId} no esta encargado del cliente con id ${id}`)
            }

            cliente = await Cliente.findByIdAndUpdate( id, input, {new: true})
            return cliente
        },

        eliminarCliente: async (_, { id }, ctx) => {

            const usuarioId = ctx.usuario.id

            let cliente = await Cliente.findById(id)
            if(!cliente) {
                throw new  Error(`El Cliente con el Id ${id} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El usuario con id ${usuarioId} no esta encargado del cliente con id ${id}`)
            }

            cliente = await Cliente.findByIdAndDelete(id)
            return 'Cliente eliminado con éxito!'
        },

        //Cliente_Banco_Sucursal
        nuevaCuenta: async (_, { input }, ctx) => {

            const usuarioId = ctx.usuario.id

            const { clienteId, sucursalId, numeroCuenta, saldoCuenta, tipoCuenta } = input

            let cliente = await Cliente.findById(clienteId)
            if(!cliente) {
                throw new  Error(`El Cliente con Id ${clienteId} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El usuario con id ${usuarioId} no esta encargado del cliente con id ${clienteId}`)
            }

            const sucursal = await Sucursal.findById(sucursalId)
            if(!sucursal) {
                throw new  Error(`La sucursal con Id ${sucursalId} no existe.`)
            }

            const { bancoId } = sucursal
            const banco = await Banco.findById(bancoId)
            if(!banco) { //Innecesaria debido a que el id del banco se obtiene de una sucursal existente
                throw new  Error(`El banco con Id ${bancoId} no existe.`)
            }

            let cuentas = []
            let clientes = await Cliente.find( { usuarioId })

            for (const c of clientes)
            {
                cuentas = await ClienteBancoSucursal.find( { clienteId:c.id } )
                for (const c of cuentas) {
                    if(c.bancoId.toString() !== bancoId.toString()) {
                        throw new  Error(`El usuario con id ${usuarioId} solo gestiona cuentas del banco con id ${c.bancoId}.`)
                    }
                }

            }

            let cuenta = await ClienteBancoSucursal.findOne({numeroCuenta})
            if(cuenta) {
                throw new  Error(`La cuenta con numero de cuenta ${numeroCuenta} ya existe.`)
            }

            cliente.saldoActual += saldoCuenta
            await Cliente.findByIdAndUpdate(clienteId, cliente, {new: true})

            const nuevaCuenta = new ClienteBancoSucursal(input)
            nuevaCuenta.bancoId = bancoId

            try {
                return await nuevaCuenta.save()
            } catch (error) {
                console.log(error)
            }
        },

        modificarCuenta: async (_, { id, input }, ctx) => {

            const { clienteId, sucursalId, numeroCuenta, saldoCuenta, tipoCuenta } = input

            const usuarioId = ctx.usuario.id

            let cuenta = await ClienteBancoSucursal.findById(id)
            if(!cuenta) {
                throw new  Error(`La cuenta con id ${id} no existe.`)
            }

            const clienteOriginal = await Cliente.findById(cuenta.clienteId)
            if(!clienteOriginal) {
                throw new  Error(`El cliente con id ${cuenta.clienteId} no existe.`)
            }

            if(clienteOriginal.usuarioId != usuarioId) {
                throw new  Error(`El cliente con id ${cuenta.clienteId} no es cliente del usuario con id ${usuarioId}.`)
            }

            const cliente = await Cliente.findById(clienteId)
            if(!cliente) {
                throw new  Error(`El cliente con id ${clienteId} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El cliente con id ${cuenta.clienteId} no es cliente del usuario con id ${usuarioId}.`)
            }

            const sucursal = await Sucursal.findById(sucursalId)
            if(!sucursal) {
                throw new  Error(`La sucursal con id ${sucursalId} no existe.`)
            }

            if(sucursal.bancoId.toString() !== cuenta.bancoId.toString()) {
                throw new  Error(`La sucursal con id ${sucursalId} no pertenece al banco con id ${cuenta.bancoId}.`)
            }

            const cuentaNumeroCuenta = await ClienteBancoSucursal.findOne({numeroCuenta})
            if(cuentaNumeroCuenta && cuentaNumeroCuenta.id != id) {
                throw new  Error(`La cuenta con numero de cuenta ${numeroCuenta} ya existe.`)
            }

            clienteOriginal.saldoActual -= cuenta.saldoCuenta
            cliente.saldoActual += saldoCuenta

            await Cliente.findByIdAndUpdate(clienteOriginal.id, clienteOriginal, {new: true})
            await Cliente.findByIdAndUpdate(cliente.id, cliente, {new: true})

            try {
                return await ClienteBancoSucursal.findByIdAndUpdate(id, input, {new: true})
            } catch (error) {
                console.log(error)
            }
        },

        eliminarCuenta: async (_, { id }, ctx) => {

            const usuarioId = ctx.usuario.id

            const cuenta = await ClienteBancoSucursal.findById(id)
            if(!cuenta) {
                throw new  Error(`La cuenta con id ${id} no existe.`)
            }

            const cliente = await Cliente.findById(cuenta.clienteId)
            if(!cliente) {
                throw new  Error(`El cliente con id ${cuenta.clienteId} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El cliente con id ${cuenta.clienteId} no es cliente del usuario con id ${usuarioId}.`)
            }

            cliente.saldoActual -= cuenta.saldoCuenta
            await Cliente.findByIdAndUpdate(cliente.id, cliente, {new: true})

            await ClienteBancoSucursal.findByIdAndDelete(id)

            return 'Se eliminó la cuenta con éxito'
        },

        //Transacciones
        transferir: async (_, { cuentaOrigenId, cuentaDestinoId, monto}, ctx) => {

            const usuarioId = ctx.usuario.id
            const usuarioNombre = ctx.usuario.nombre

            console.log(cuentaOrigenId)
            console.log(cuentaDestinoId)
            console.log(monto)

            //Validando si existen las cuentas
            let cuentaOrigen = await ClienteBancoSucursal.findById(cuentaOrigenId)
            if(!cuentaOrigen) {
                throw new  Error(`La cuenta con id ${cuentaOrigenId} no existe.`)
            }

            let cuentaDestino = await ClienteBancoSucursal.findById(cuentaDestinoId)
            if(!cuentaDestino) {
                throw new  Error(`La cuenta con id ${cuentaDestinoId} no existe.`)
            }

            //Validando si el banco de cada cuenta existe
            let bancoOrigen = await Banco.findById(cuentaOrigen.bancoId)
            if(!bancoOrigen) {
                throw new  Error(`El banco con id ${cuentaOrigen.bancoId} no existe.`)
            }

            let bancoDestino = await Banco.findById(cuentaDestino.bancoId)
            if(!bancoDestino) {
                throw new  Error(`El banco con id ${cuentaDestino.bancoId} no existe.`)
            }

            //Validando si las cuentas son del mismo banco
            if(bancoOrigen.id != bancoDestino.id) {
                throw new  Error(`Las cuentas no pertenecen al mismo banco.`)
            }

            //Validando si existen los clientes de las cuentas
            let clienteOrigen = await Cliente.findById(cuentaOrigen.clienteId)
            if(!clienteOrigen) {
                throw new  Error(`El cliente con id ${cuentaOrigen.clienteId} no existe.`)
            }

            let clienteDestino = await Cliente.findById(cuentaDestino.clienteId)
            if(!clienteDestino) {
                throw new  Error(`El cliente con id ${cuentaDestino.clienteId} no existe.`)
            }

            //Verificando si ambos clientes pertenecen al mismo vendedor
            if(clienteOrigen.usuarioId != usuarioId) {
                throw new  Error(`El cliente ${clienteOrigen.nombre} no es cliente del usuario ${usuarioNombre}.`)
            }

            if(clienteDestino.usuarioId != usuarioId) {
                throw new  Error(`El cliente ${clienteDestino.nombre} no es cliente del usuario ${usuarioNombre}.`)
            }

            //Verificar si la cuenta de origen tiene los fondos para esa transferencia
            if(cuentaOrigen.saldoCuenta < monto) {
                throw new  Error(`La cuenta ${cuentaOrigenId} no tiene fondos suficientes.`)
            }

            //Transferir el dinero
            cuentaOrigen.saldoCuenta -= monto
            cuentaDestino.saldoCuenta += monto

            if(clienteOrigen.id == clienteDestino.id) {
            } else {
                clienteOrigen.saldoActual -= monto
                clienteDestino.saldoActual += monto
            }

            console.log(clienteOrigen, clienteDestino)


            try {
                //Actualizar saldo de las cuentas
                await ClienteBancoSucursal.findByIdAndUpdate(cuentaOrigen.id, cuentaOrigen, {new:true})
                await ClienteBancoSucursal.findByIdAndUpdate(cuentaDestino.id, cuentaDestino, {new:true})

                //Actualizar saldo de los clientes
                await Cliente.findByIdAndUpdate(clienteOrigen.id, clienteOrigen, {new:true})
                await Cliente.findByIdAndUpdate(clienteDestino.id, clienteDestino, {new:true})

                return 'Transferencia realizada con éxito'
            } catch (error) {
                console.log(error)
            }
        },

        nuevaDepsito: async (_, { input }, ctx) => {

            const usuarioId = ctx.usuario.id

            const { clienteId, sucursalId, numeroCuenta, saldoCuenta, tipoCuenta } = input

            let cliente = await Cliente.findById(clienteId)
            if(!cliente) {
                throw new  Error(`El Cliente con Id ${clienteId} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El usuario con id ${usuarioId} no esta encargado del cliente con id ${clienteId}`)
            }

            const sucursal = await Sucursal.findById(sucursalId)
            if(!sucursal) {
                throw new  Error(`La sucursal con Id ${sucursalId} no existe.`)
            }

            const { bancoId } = sucursal
            const banco = await Banco.findById(bancoId)
            if(!banco) { //Innecesaria debido a que el id del banco se obtiene de una sucursal existente
                throw new  Error(`El banco con Id ${bancoId} no existe.`)
            }

            let cuentas = []
            let clientes = await Cliente.find( { usuarioId })

            for (const c of clientes)
            {
                cuentas = await ClienteBancoSucursal.find( { clienteId:c.id } )
                for (const c of cuentas) {
                    if(c.bancoId.toString() !== bancoId.toString()) {
                        throw new  Error(`El usuario con id ${usuarioId} solo gestiona cuentas del banco con id ${c.bancoId}.`)
                    }
                }

            }
            cliente.saldoActual += saldoCuenta
            await Cliente.findByIdAndUpdate(clienteId, cliente, {new: true})

            const depsito = new Deposito(input)
            nuevaDepsito.bancoId = bancoId

            try {
                return await nuevaDepsito.save()
            } catch (error) {
                console.log(error)
            }
        },

        eliminarDepsito: async (_, { id }, ctx) => {

            const usuarioId = ctx.usuario.id

            const depsito = await Deposito.findById(id)
            if(!depsito) {
                throw new  Error(`El deposito con id ${id} no existe.`)
            }

            const cliente = await Cliente.findById(cuenta.clienteId)
            if(!cliente) {
                throw new  Error(`El cliente con id ${cuenta.clienteId} no existe.`)
            }

            if(cliente.usuarioId != usuarioId) {
                throw new  Error(`El cliente con id ${cuenta.clienteId} no es cliente del usuario con id ${usuarioId}.`)
            }

            await DepositoPlazoFijoSchema.findByIdAndDelete(id)

            return 'Se eliminó la cuenta con éxito'
        },

    }
}

module.exports = resolvers