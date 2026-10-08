import { supabase } from './supabase'

export const obtenerEstadisticasEvento = async (eventoId) => {
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select(`
      id,
      total,
      metodo_pago,
      created_at,
      detalle_ventas (
        producto_id,
        cantidad,
        precio_unitario,
        subtotal,
        productos (
          nombre,
          costo
        )
      )
    `)
    .eq('evento_id', eventoId)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  const ventasSeguras = ventas || []

  const cantidadVentas =
    ventasSeguras.length

  const ingresosTotales =
    ventasSeguras.reduce(
      (total, venta) =>
        total + Number(venta.total || 0),
      0
    )

  const detalles =
    ventasSeguras.flatMap(
      (venta) =>
        venta.detalle_ventas || []
    )

  const bebidasVendidas =
    detalles.reduce(
      (total, detalle) =>
        total +
        Number(detalle.cantidad || 0),
      0
    )

  const costoVendido =
    detalles.reduce(
      (total, detalle) =>
        total +
        Number(detalle.cantidad || 0) *
          Number(
            detalle.productos?.costo || 0
          ),
      0
    )

  const gananciaEstimada =
    ingresosTotales - costoVendido

  const ticketPromedio =
    cantidadVentas > 0
      ? ingresosTotales / cantidadVentas
      : 0

  // =========================
  // PRODUCTOS MÁS VENDIDOS
  // =========================

  const productos = {}

  for (const detalle of detalles) {
    const productoId =
      detalle.producto_id

    if (!productos[productoId]) {
      productos[productoId] = {
        nombre:
          detalle.productos?.nombre ||
          'Producto desconocido',
        cantidad: 0,
        ingresos: 0,
      }
    }

    productos[productoId].cantidad +=
      Number(detalle.cantidad || 0)

    productos[productoId].ingresos +=
      Number(detalle.subtotal || 0)
  }

  const productosMasVendidos =
    Object.values(productos)
      .sort(
        (a, b) =>
          b.cantidad - a.cantidad
      )
      .slice(0, 10)

  // =========================
  // MÉTODOS DE PAGO
  // =========================

  const metodos = {}

  for (const venta of ventasSeguras) {
    const metodo =
      venta.metodo_pago || 'Otro'

    if (!metodos[metodo]) {
      metodos[metodo] = {
        metodo,
        cantidad: 0,
        total: 0,
      }
    }

    metodos[metodo].cantidad += 1

    metodos[metodo].total +=
      Number(venta.total || 0)
  }

  const ventasPorMetodo =
    Object.values(metodos)
      .sort(
        (a, b) =>
          b.total - a.total
      )

  // =========================
  // VENTAS POR HORA
  // =========================

  const horas = {}

  for (const venta of ventasSeguras) {
    const fecha =
      new Date(venta.created_at)

    const horaNumero =
      fecha.getHours()

    const horaTexto =
      `${String(horaNumero).padStart(
        2,
        '0'
      )}:00`

    if (!horas[horaTexto]) {
      horas[horaTexto] = {
        hora: horaTexto,
        cantidadVentas: 0,
        ingresos: 0,
      }
    }

    horas[horaTexto].cantidadVentas += 1

    horas[horaTexto].ingresos +=
      Number(venta.total || 0)
  }

  const ventasPorHora =
    Object.values(horas)
      .sort(
        (a, b) =>
          a.hora.localeCompare(
            b.hora
          )
      )

  let mejorHora = null

  if (ventasPorHora.length > 0) {
    mejorHora =
      [...ventasPorHora].sort(
        (a, b) =>
          b.ingresos - a.ingresos
      )[0]
  }

  return {
    cantidadVentas,
    ingresosTotales,
    bebidasVendidas,
    costoVendido,
    gananciaEstimada,
    ticketPromedio,
    productosMasVendidos,
    ventasPorMetodo,
    ventasPorHora,
    mejorHora,
  }
}