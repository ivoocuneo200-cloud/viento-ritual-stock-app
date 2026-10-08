import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

function PruebaSupabase() {
  const [eventos, setEventos] = useState([])
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarEventos = async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')

      if (error) {
        console.error('ERROR SUPABASE:', error)
        setError(error.message)
      } else {
        console.log('EVENTOS:', data)
        setEventos(data)
      }

      setCargando(false)
    }

    cargarEventos()
  }, [])

  if (cargando) {
    return <h2>Cargando...</h2>
  }

  if (error) {
    return (
      <div>
        <h1>Error de conexión</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Prueba Supabase</h1>

      {eventos.length === 0 ? (
        <p>No se encontraron eventos.</p>
      ) : (
        eventos.map((evento) => (
          <div key={evento.id}>
            <h3>{evento.nombre}</h3>
            <p>{evento.fecha}</p>
            <p>{evento.lugar}</p>
            <p>{evento.estado}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default PruebaSupabase