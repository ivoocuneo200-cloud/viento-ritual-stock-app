import { supabase } from './supabase'

export const obtenerEventos = async () => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export const crearEventoSupabase = async (evento) => {
  const { data, error } = await supabase
    .from('eventos')
    .insert([
      {
        nombre: evento.nombre,
        fecha: evento.fecha,
        lugar: evento.lugar,
        estado: 'Activo',
      },
    ])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export const cerrarEventoSupabase = async (eventoId) => {
  const { data, error } = await supabase
    .from('eventos')
    .update({
      estado: 'Finalizado',
    })
    .eq('id', eventoId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
export const eliminarEventoSupabase = async (eventoId) => {
  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', eventoId)

  if (error) {
    throw error
  }

  return true
}