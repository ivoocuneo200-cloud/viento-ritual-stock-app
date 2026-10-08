
import { supabase } from './supabase'

export const obtenerResumenEvento = async (eventoId) => {
  const [
    inventarioRespuesta,
    ventasRespuesta,
    movimientosRespuesta,
    eventoRespuesta,
  ] = await Promise.all([
    supabase
      .from('inventario_evento')
      .select(`
        stock,
        productos (
          id,
          nombre,
          categoria,
          costo,
          precio
        )
      `)
      .eq('evento_id', eventoId),

    supabase
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
          productos (
            nombre,
            costo
          )
        )
      `)
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: false }),

    supabase
      .from('movimientos')
      .select(`
        id,
        tipo,
        motivo,
        cantidad,
        created_at,
        productos (
          nombre
        )
      `)
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: false })
      .limit(8),

    supabase
      .from('eventos')
      .select('id, nombre, estado')
      .eq('id', eventoId)
      .single(),
  ])

  for (const respuesta of [
    inventarioRespuesta,
    ventasRespuesta,
    movimientosRespuesta,
    eventoRespuesta,
  ]) {
    if (respuesta.error) {
      throw respuesta.error
    }
  }

  const inventario = inventarioRespuesta.data || []
  const ventas = ventasRespuesta.data || []
  const movimientos = movimientosRespuesta.data || []

  const unidadesDisponibles = inventario.reduce(
    (total, item) => total + Number(item.stock),
    0
  )

  const costoStock = inventario.reduce(
    (total, item) =>
      total +
      Number(item.stock) *
        Number(item.productos?.costo || 0),
    0
  )

  const ingresos = ventas.reduce(
    (total, venta) => total + Number(venta.total),
    0
  )

  const detalles = ventas.flatMap(
    (venta) => venta.detalle_ventas || []
  )

  const unidadesVendidas = detalles.reduce(
    (total, detalle) =>
      total + Number(detalle.cantidad),
    0
  )

  const costoVendido = detalles.reduce(
    (total, detalle) =>
      total +
      Number(detalle.cantidad) *
        Number(detalle.productos?.costo || 0),
    0
  )

  const gananciaEstimada = ingresos - costoVendido

  const categorias = {}

  for (const item of inventario) {
    const categoria = item.productos?.categoria || 'Otros'

    categorias[categoria] =
      (categorias[categoria] || 0) +
      Number(item.stock)
  }

  const stockPorCategoria = Object.entries(categorias)
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }))
    .sort((a, b) => b.cantidad - a.cantidad)

  const productosVendidos = {}

  for (const detalle of detalles) {
    const id = detalle.producto_id

    if (!productosVendidos[id]) {
      productosVendidos[id] = {
        nombre:
          detalle.productos?.nombre ||
          'Producto desconocido',
        cantidad: 0,
      }
    }

    productosVendidos[id].cantidad +=
      Number(detalle.cantidad)
  }

  const topVendidos = Object.values(productosVendidos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)

  const ingresosPorHora = {}

  for (const venta of ventas) {
    const hora = new Date(
      venta.created_at
    ).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      hour12: false,
    })

    ingresosPorHora[hora] =
      (ingresosPorHora[hora] || 0) +
      Number(venta.total)
  }

  const ventasPorHora = Object.entries(ingresosPorHora)
    .map(([hora, total]) => ({
      hora: `${hora}:00`,
      total,
    }))
    .sort((a, b) => a.hora.localeCompare(b.hora))

  return {
    evento: eventoRespuesta.data,
    unidadesDisponibles,
    unidadesVendidas,
    ingresos,
    costoStock,
    costoVendido,
    gananciaEstimada,
    cantidadVentas: ventas.length,
    stockPorCategoria,
    topVendidos,
    ventasPorHora,
    movimientos,
  }
}
