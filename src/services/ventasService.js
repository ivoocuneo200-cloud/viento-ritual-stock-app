import { supabase } from './supabase'

export const registrarVentaSupabase = async ({
  eventoId,
  items,
  metodoPago,
}) => {
  const itemsSupabase = items.map((item) => ({
    producto_id: item.productoId,
    cantidad: Number(item.cantidad),
  }))

  const { data, error } = await supabase.rpc(
    'registrar_venta',
    {
      p_evento_id: Number(eventoId),
      p_items: itemsSupabase,
      p_metodo_pago: metodoPago,
      p_usuario: 'Administrador',
    }
  )

  if (error) {
    throw error
  }

  return data
}