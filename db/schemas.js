const { gql } = require('apollo-server')

const typeDefs = gql `

    #Usuario
    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
        usuarioId: ID
    } 
    
    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }
    
    #Token
    type Token {
        token: String
    }
    
    input AutenticarInput {
        email: String
        password: String
    }
    
    #Cliente
    type Cliente {
        id: ID
        nombre: String
        direccion: String
        telefono: String
        saldoActual: Float
        tipo: TipoCliente
        usuarioId: ID
    }
    
    input ClienteInput {
        nombre: String
        direccion: String
        telefono: String
        tipo: TipoCliente
    }
    
    enum TipoCliente {
        Categoria_A
        Categoria_B
        Categoria_C
    }
    
    #Sucursal
    type Sucursal {
        id: ID
        nombre: String
        direccion: String
        bancoId: ID
    }
    
    input SucursalInput {
        nombre: String
        direccion: String
        bancoId: ID
    }
    
    #Banco
    type Banco {
        id: ID
        nombre: String
    }
    
    input BancoInput {
        nombre: String
    }
    
    #Cliente_Banco_Sucursal
    type ClienteBancoSucursal {
        id: ID
        clienteId: ID
        bancoId: ID
        sucursalId: ID
        numeroCuenta: Int
        saldoCuenta: Float
        tipoCuenta: TipoCuenta
    }

    input ClienteBancoSucursalInput {
        clienteId: ID
        sucursalId: ID
        numeroCuenta: Int
        saldoCuenta: Float
        tipoCuenta: TipoCuenta
    }
    
    #ahorros a plazos fijos
    type AhorrosPlazosFijos {
        id: ID
        oficialId:ID
        clienteId: ID
        bancoId: ID
        sucursalId: ID
        fechaDelDeposito: Date
        PlazoDelDeposito: TiempoPlazo
        monedaDelDeposito: TipoMoneda
        montoDelDeposito: Float
    }
    
    enum TiempoPlazo{
    6 meses
    12 meses
    24 meses
    }
    enum TipoModena{
    BOL
    USD
    }

    input ClienteBancoSucursalInput {
        clienteId: ID
        sucursalId: ID
        numeroCuenta: Int
        saldoCuenta: Float
        tipoCuenta: TipoCuenta
    }
    
    enum TipoCuenta {
        CajaAhorro
        CuentaCorriente
    }
    
    type Query {
    
        #Usuario
        obtenerUsuarios: [Usuario]
        obtenerUsuario(token: String): Usuario
        
        #Banco
        obtenerBancos: [Banco]
        
        #Sucursal
        obtenerSucursales: [Sucursal]
        obtenerSucursalesByBanco(bancoId: ID): [Sucursal]
        obtenerSucursalesByNombreBanco(nombreBanco: String): [Sucursal]
        
        #Cliente
        obtenerClientes: [Cliente]
        obtenerClientesUsuario: [Cliente]
        
        #Cliente_Banco_Sucursal (Cuenta)
        obtenerCuentas: [ClienteBancoSucursal]
        obtenerCuentasByUsuario: [ClienteBancoSucursal]
        obtenerCuentasByCliente(id: ID): [ClienteBancoSucursal]
    }
    
    type Mutation {
        
        #Usuario
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token
        autenticarUsuarios(input: [AutenticarInput]): [Token]
        
        #Banco
        nuevoBanco(input: BancoInput): Banco
        modificarBanco(id: ID, input: BancoInput): Banco
        eliminarBanco(id: ID): String
        
        #Sucursal
        nuevaSucursal(input: SucursalInput): Sucursal
        modificarSucursal(id: ID, input: SucursalInput): Sucursal
        eliminarSucursal(id: ID, bancoId: ID): String
        
        #Cliente
        nuevoCliente(input: ClienteInput): Cliente
        modificarCliente(id: ID, input: ClienteInput): Cliente
        eliminarCliente(id: ID): String
        
        #Cliente_Banco_Sucursal (Cuenta)
        nuevaCuenta(input: ClienteBancoSucursalInput): ClienteBancoSucursal
        modificarCuenta(id: ID, input: ClienteBancoSucursalInput): ClienteBancoSucursal
        eliminarCuenta(id: ID): String
        
        #Transacciones
        transferir(cuentaOrigenId: ID, cuentaDestinoId: ID, monto: Float): String
    }
`

module.exports = typeDefs