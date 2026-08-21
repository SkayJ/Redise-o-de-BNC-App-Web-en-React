// src/lib/dbSeed.js

export const INITIAL_DB = {
  User: {
    id: "user_skayj_01",
    username: "skayj",
    full_name: "John Ferreira",
    email: "johnferreira1901@gmail.com",
    role: "user"
  },
  BankAccount: [
    {
      id: "acc_corriente_ves",
      created_by_id: "user_skayj_01",
      account_number: "019101******6789",
      account_type: "corriente",
      balance: 18420.50,
      currency: "VES",
      bank_name: "Banco Nacional de Crédito",
      holder_name: "John Ferreira",
      holder_type: "natural",
      cedula_type: "V",
      cedula_number: "30137607",
      phone: "04140506943",
      is_primary: true
    },
    {
      id: "acc_ahorro_usd",
      created_by_id: "user_skayj_01",
      account_number: "019101******7654",
      account_type: "ahorro",
      balance: 650.00,
      currency: "USD",
      bank_name: "Banco Nacional de Crédito",
      holder_name: "John Ferreira",
      holder_type: "natural",
      cedula_type: "V",
      cedula_number: "30137607",
      phone: "04140506943",
      is_primary: false
    },
    {
      id: "acc_credito_ves",
      created_by_id: "user_skayj_01",
      account_number: "459100******4321",
      account_type: "credito",
      balance: 25000.00, // Límite de crédito disponible
      currency: "VES",
      bank_name: "Banco Nacional de Crédito",
      holder_name: "John Ferreira",
      holder_type: "natural",
      cedula_type: "V",
      cedula_number: "30137607",
      phone: "04140506943",
      is_primary: false
    }
  ],
  Transaction: [
    {
      id: "tx_001",
      reference_number: "002847194",
      type: "pago_movil",
      amount: 320.00,
      currency: "VES",
      description: "Almuerzo Corp",
      status: "completada",
      direction: "salida",
      destination_bank: "Banco de Venezuela",
      destination_account: "01020304050607080901",
      destination_name: "Maria Perez",
      account_id: "acc_corriente_ves",
      created_date: "2026-07-13T11:45:00.000Z"
    },
    {
      id: "tx_002",
      reference_number: "002849912",
      type: "transferencia",
      amount: 8500.00,
      currency: "VES",
      description: "Abono de Cuenta Externa",
      status: "completada",
      direction: "entrada",
      destination_bank: "Banco Nacional de Crédito",
      destination_account: "01910104231000456789",
      destination_name: "John Ferreira",
      account_id: "acc_corriente_ves",
      created_date: "2026-07-13T08:15:00.000Z"
    },
    {
      id: "tx_003",
      reference_number: "002851122",
      type: "pago_servicio",
      amount: 450.00,
      currency: "VES",
      description: "Pago de Servicio Electrico - CORPOELEC",
      status: "completada",
      direction: "salida",
      destination_bank: "BNC Servicios",
      destination_account: "Contrato-100029384",
      destination_name: "Corpoelec Nacional",
      account_id: "acc_corriente_ves",
      created_date: "2026-07-12T16:20:00.000Z"
    },
    {
      id: "tx_004",
      reference_number: "002853344",
      type: "compra_dolares",
      amount: 1470.00, // Monto debitado en Bs
      currency: "VES",
      description: "Mesa de Cambio - Compra $35.00 BCV",
      status: "completada",
      direction: "salida",
      destination_bank: "Banco Nacional de Crédito",
      destination_account: "01910104231000987654",
      destination_name: "Cuenta USD",
      account_id: "acc_corriente_ves",
      created_date: "2026-07-12T10:05:00.000Z"
    },
    {
      id: "tx_005",
      reference_number: "002853345",
      type: "compra_dolares",
      amount: 35.00, // Monto recibido en la cuenta de ahorros
      currency: "USD",
      description: "Mesa de Cambio - Recepcion Divisas",
      status: "completada",
      direction: "entrada",
      destination_bank: "Banco Nacional de Crédito",
      destination_account: "01910104231000987654",
      destination_name: "John Ferreira",
      account_id: "acc_ahorro_usd",
      created_date: "2026-07-12T10:05:00.000Z"
    },
    {
      id: "tx_006",
      reference_number: "002856677",
      type: "pago_servicio",
      amount: 185.50,
      currency: "VES",
      description: "Pago de Factura CANTV",
      status: "completada",
      direction: "salida",
      destination_bank: "BNC Servicios",
      destination_account: "02432321122",
      destination_name: "CANTV Telecomunicaciones",
      account_id: "acc_corriente_ves",
      created_date: "2026-07-11T09:30:00.000Z"
    },
    {
      id: "tx_007",
      reference_number: "459100129",
      type: "pago_servicio",
      amount: 1250.00,
      currency: "VES",
      description: "Consumo Tienda Automotriz - Tarjeta Crédito",
      status: "completada",
      direction: "salida",
      destination_bank: "Punto de Venta",
      destination_account: "Visa Crédito BNC",
      destination_name: "Repuestos El Samán",
      account_id: "acc_credito_ves",
      created_date: "2026-07-10T15:40:00.000Z"
    },
    {
      id: "tx_008",
      reference_number: "002859900",
      type: "pago_movil",
      amount: 120.00,
      currency: "VES",
      description: "Transferencia Express Móvil",
      status: "rechazada", // Una rechazada para validar los estilos visuales de error
      direction: "salida",
      destination_bank: "Banco Mercantil",
      destination_account: "01050011223344556677",
      destination_name: "Pedro Infante",
      account_id: "acc_corriente_ves",
      created_date: "2026-07-09T18:12:00.000Z"
    }
  ],
  Beneficiary: [
    {
      id: "ben_01",
      name: "Carlos Mendoza",
      holder_type: "natural",
      cedula_type: "V",
      cedula_number: "18555666",
      bank_code: "0102",
      bank_name: "Banco de Venezuela",
      account_number: "01020111223344556677",
      phone: "04243334455",
      is_favorite: true
    }
  ],
  Notification: [
    {
      id: "not_01",
      title: "Ingreso Detectado",
      message: "Tu cuenta corriente ha recibido una transferencia de 8,500.00 VES",
      type: "recepcion",
      read: false
    }
  ],
  AccountApplication: []
};