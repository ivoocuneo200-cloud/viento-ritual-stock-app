import { supabase } from './supabase'

export const obtenerMovimientosEvento = async (
  eventoId
) => {
  const { data, error } = await supabase
    .from('movimientos')
    .select(`
      id,
      evento_id,
      producto_id,
      tipo,
      motivo,
      cantidad,
      stock_anterior,
      stock_nuevo,
      observacion,
      usuario,
      created_at,
      productos (
        nombre
      )
    `)
    .eq('evento_id', eventoId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data.map((movimiento) => ({
    id: movimiento.id,

    productoId:
      movimiento.producto_id,

    producto:
      movimiento.productos?.nombre ||
      'Producto desconocido',

    tipo:
      movimiento.tipo,

    motivo:
      movimiento.motivo,

    cantidad:
      movimiento.cantidad,

    stockAnterior:
      movimiento.stock_anterior,

    stockNuevo:
      movimiento.stock_nuevo,

    observacion:
      movimiento.observacion,

    usuario:
      movimiento.usuario,

    createdAt:
      movimiento.created_at,
  }))
}