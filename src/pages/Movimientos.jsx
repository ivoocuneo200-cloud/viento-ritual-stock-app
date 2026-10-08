import { useEffect, useState } from 'react'

import {
  obtenerMovimientosEvento,
} from '../services/movimientosService'

function Movimientos() {
  const [movimientos, setMovimientos] =
    useState([])

  const [busqueda, setBusqueda] =
    useState('')

  const [
    tipoSeleccionado,
    setTipoSeleccionado,
  ] = useState('Todos')

  const [cargando, setCargando] =
    useState(true)

  const cargarMovimientos = async () => {
    try {
      setCargando(true)

      const eventoGuardado =
        localStorage.getItem(
          'eventoActualId'
        )

      if (!eventoGuardado) {
        setMovimientos([])
        return
      }

      const data =
        await obtenerMovimientosEvento(
          Number(eventoGuardado)
        )

      setMovimientos(data)

    } catch (error) {
      console.error(
        'Error al cargar movimientos:',
        error
      )

      alert(
        'No se pudieron cargar los movimientos.'
      )

    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarMovimientos()
  }, [])

  const movimientosFiltrados =
    movimientos.filter(
      (movimiento) => {

        const coincideBusqueda =
          movimiento.producto
            .toLowerCase()
            .includes(
              busqueda.toLowerCase()
            )

        const coincideTipo =
          tipoSeleccionado ===
            'Todos' ||
          movimiento.tipo ===
            tipoSeleccionado

        return (
          coincideBusqueda &&
          coincideTipo
        )
      }
    )

  const formatearFecha = (
    fechaOriginal
  ) => {
    const fecha =
      new Date(fechaOriginal)

    return fecha.toLocaleDateString(
      'es-AR'
    )
  }

  const formatearHora = (
    fechaOriginal
  ) => {
    const fecha =
      new Date(fechaOriginal)

    return fecha.toLocaleTimeString(
      'es-AR',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  if (cargando) {
    return (
      <div className="movements-page">
        <h1>Movimientos</h1>

        <p>
          Cargando movimientos...
        </p>
      </div>
    )
  }

  return (
    <div className="movements-page">

      <div className="page-header">

        <div>

          <h1>Movimientos</h1>

          <p>
            Historial de entradas y
            salidas del inventario.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={cargarMovimientos}
        >
          Actualizar
        </button>

      </div>

      <div className="movement-filters">

        <input
          type="text"
          className="search-input"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        <div className="category-filters">

          <button
            className={
              tipoSeleccionado ===
              'Todos'
                ? 'filter-button active'
                : 'filter-button'
            }
            onClick={() =>
              setTipoSeleccionado(
                'Todos'
              )
            }
          >
            Todos
          </button>

          <button
            className={
              tipoSeleccionado ===
              'entrada'
                ? 'filter-button active'
                : 'filter-button'
            }
            onClick={() =>
              setTipoSeleccionado(
                'entrada'
              )
            }
          >
            Entradas
          </button>

          <button
            className={
              tipoSeleccionado ===
              'salida'
                ? 'filter-button active'
                : 'filter-button'
            }
            onClick={() =>
              setTipoSeleccionado(
                'salida'
              )
            }
          >
            Salidas
          </button>

        </div>

      </div>

      <div className="inventory-card">

        <div className="inventory-table-wrapper">

          <table
            className="
              inventory-table
              movements-table
            "
          >

            <thead>

              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Producto</th>
                <th>Movimiento</th>
                <th>Motivo</th>
                <th>Cantidad</th>
                <th>Stock</th>
                <th>Usuario</th>
                <th>Observación</th>
              </tr>

            </thead>

            <tbody>

              {movimientosFiltrados.length >
              0 ? (

                movimientosFiltrados.map(
                  (movimiento) => (

                    <tr
                      key={
                        movimiento.id
                      }
                    >

                      <td>
                        {formatearFecha(
                          movimiento.createdAt
                        )}
                      </td>

                      <td>
                        {formatearHora(
                          movimiento.createdAt
                        )}
                      </td>

                      <td>
                        <strong>
                          {
                            movimiento.producto
                          }
                        </strong>
                      </td>

                      <td>

                        <span
                          className={
                            movimiento.tipo ===
                            'entrada'
                              ? 'movement-type movement-entry'
                              : 'movement-type movement-exit'
                          }
                        >
                          {movimiento.tipo ===
                          'entrada'
                            ? 'Entrada'
                            : 'Salida'}
                        </span>

                      </td>

                      <td>
                        {
                          movimiento.motivo
                        }
                      </td>

                      <td>

                        <strong
                          className={
                            movimiento.tipo ===
                            'entrada'
                              ? 'quantity-entry'
                              : 'quantity-exit'
                          }
                        >
                          {movimiento.tipo ===
                          'entrada'
                            ? '+'
                            : '-'}

                          {
                            movimiento.cantidad
                          }
                        </strong>

                      </td>

                      <td>

                        {
                          movimiento.stockAnterior
                        }

                        {' → '}

                        {
                          movimiento.stockNuevo
                        }

                      </td>

                      <td>
                        {movimiento.usuario ||
                          '-'}
                      </td>

                      <td>
                        {movimiento.observacion ||
                          '-'}
                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="empty-table-message"
                  >
                    Todavía no hay
                    movimientos registrados.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default Movimientos