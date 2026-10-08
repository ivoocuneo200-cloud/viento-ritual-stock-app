import { useEffect, useState } from 'react'
import { obtenerInventarioEvento } from '../services/inventarioService'

function PruebaInventario() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const eventoGuardado =
          localStorage.getItem('eventoActualId')

        if (!eventoGuardado) {
          setError('No hay un evento seleccionado.')
          return
        }

        const data = await obtenerInventarioEvento(
          Number(eventoGuardado)
        )

        console.log('INVENTARIO SUPABASE:', data)

        setProductos(data)
      } catch (error) {
        console.error(error)
        setError(error.message)
      } finally {
        setCargando(false)
      }
    }

    cargarInventario()
  }, [])

  if (cargando) {
    return <h2>Cargando inventario...</h2>
  }

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Inventario desde Supabase</h1>

      {productos.length === 0 ? (
        <p>Este evento todavía no tiene productos.</p>
      ) : (
        productos.map((producto) => (
          <div
            key={producto.id}
            style={{
              marginBottom: '20px',
            }}
          >
            <h3>{producto.nombre}</h3>

            <p>
              Categoría: {producto.categoria}
            </p>

            <p>
              Stock: {producto.stock}
            </p>

            <p>
              Costo: ${producto.costo}
            </p>

            <p>
              Precio: ${producto.precio}
            </p>
          </div>
        ))
      )}
    </div>
  )
}

export default PruebaInventario