import { useEffect, useState } from 'react'

import {
  obtenerEstadisticasEvento,
} from '../services/estadisticasService'

function Estadisticas() {
  const [
    estadisticas,
    setEstadisticas,
  ] = useState(null)

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  const cargarEstadisticas =
    async () => {
      try {
        setCargando(true)
        setError('')

        const eventoGuardado =
          localStorage.getItem(
            'eventoActualId'
          )

        if (!eventoGuardado) {
          setEstadisticas(null)

          setError(
            'No hay un evento seleccionado.'
          )

          return
        }

        const data =
          await obtenerEstadisticasEvento(
            Number(eventoGuardado)
          )

        setEstadisticas(data)

      } catch (error) {
        console.error(
          'Error cargando estadísticas:',
          error
        )

        setError(
          error.message ||
            'No se pudieron cargar las estadísticas.'
        )

      } finally {
        setCargando(false)
      }
    }

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const formatearPrecio = (
    valor
  ) => {
    return Number(
      valor || 0
    ).toLocaleString(
      'es-AR',
      {
        maximumFractionDigits: 2,
      }
    )
  }

  if (cargando) {
    return (
      <div className="statistics-page">

        <h1>Estadísticas</h1>

        <p>
          Cargando estadísticas...
        </p>

      </div>
    )
  }

  if (
    error ||
    !estadisticas
  ) {
    return (
      <div className="statistics-page">

        <h1>Estadísticas</h1>

        <p>
          {error ||
            'No hay estadísticas disponibles.'}
        </p>

        <button
          className="primary-button"
          onClick={
            cargarEstadisticas
          }
        >
          Reintentar
        </button>

      </div>
    )
  }

  const maxProducto =
    Math.max(
      1,
      ...estadisticas
        .productosMasVendidos
        .map(
          (producto) =>
            producto.cantidad
        )
    )

  const maxMetodo =
    Math.max(
      1,
      ...estadisticas
        .ventasPorMetodo
        .map(
          (metodo) =>
            metodo.total
        )
    )

  const maxHora =
    Math.max(
      1,
      ...estadisticas
        .ventasPorHora
        .map(
          (hora) =>
            hora.ingresos
        )
    )

  return (
    <div className="statistics-page">

      {/* =====================
          ENCABEZADO
      ====================== */}

      <div className="page-header">

        <div>

          <h1>
            Estadísticas
          </h1>

          <p>
            Rendimiento del evento.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={
            cargarEstadisticas
          }
        >
          ↻ Actualizar
        </button>

      </div>

      {/* =====================
          TARJETAS
      ====================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >

        <div className="inventory-card">
          <div style={{ padding: 20 }}>

            <span
              style={{
                color: '#a1a1aa',
              }}
            >
              Ventas
            </span>

            <h2>
              {
                estadisticas
                  .cantidadVentas
              }
            </h2>

            <p>
              Operaciones realizadas
            </p>

          </div>
        </div>

        <div className="inventory-card">
          <div style={{ padding: 20 }}>

            <span
              style={{
                color: '#a1a1aa',
              }}
            >
              Bebidas vendidas
            </span>

            <h2>
              {
                estadisticas
                  .bebidasVendidas
              }
            </h2>

            <p>
              Unidades
            </p>

          </div>
        </div>

        <div className="inventory-card">
          <div style={{ padding: 20 }}>

            <span
              style={{
                color: '#a1a1aa',
              }}
            >
              Ingresos
            </span>

            <h2>
              $
              {formatearPrecio(
                estadisticas
                  .ingresosTotales
              )}
            </h2>

            <p>
              Total vendido
            </p>

          </div>
        </div>

        <div className="inventory-card">
          <div style={{ padding: 20 }}>

            <span
              style={{
                color: '#a1a1aa',
              }}
            >
              Ticket promedio
            </span>

            <h2>
              $
              {formatearPrecio(
                estadisticas
                  .ticketPromedio
              )}
            </h2>

            <p>
              Promedio por venta
            </p>

          </div>
        </div>

        <div className="inventory-card">
          <div style={{ padding: 20 }}>

            <span
              style={{
                color: '#a1a1aa',
              }}
            >
              Costo vendido
            </span>

            <h2>
              $
              {formatearPrecio(
                estadisticas
                  .costoVendido
              )}
            </h2>

            <p>
              Costo estimado
            </p>

          </div>
        </div>

        <div className="inventory-card">
          <div style={{ padding: 20 }}>

            <span
              style={{
                color: '#a1a1aa',
              }}
            >
              Ganancia estimada
            </span>

            <h2>
              $
              {formatearPrecio(
                estadisticas
                  .gananciaEstimada
              )}
            </h2>

            <p>
              Ingresos - costo
            </p>

          </div>
        </div>

      </div>

      {/* =====================
          MEJOR HORA
      ====================== */}

      <div
        className="inventory-card"
        style={{
          marginBottom: 24,
        }}
      >

        <div style={{ padding: 20 }}>

          <h2>
            🕐 Mejor hora de ventas
          </h2>

          {estadisticas
            .mejorHora ? (

            <div>

              <h3>
                {
                  estadisticas
                    .mejorHora
                    .hora
                }
              </h3>

              <p>
                {
                  estadisticas
                    .mejorHora
                    .cantidadVentas
                }{' '}
                ventas · $
                {formatearPrecio(
                  estadisticas
                    .mejorHora
                    .ingresos
                )}
              </p>

            </div>

          ) : (

            <p>
              Todavía no hay
              ventas registradas.
            </p>

          )}

        </div>

      </div>

      {/* =====================
          PRODUCTOS
      ====================== */}

      <div
        className="inventory-card"
        style={{
          marginBottom: 24,
        }}
      >

        <div style={{ padding: 20 }}>

          <h2>
            🏆 Productos más vendidos
          </h2>

          {estadisticas
            .productosMasVendidos
            .length > 0 ? (

            estadisticas
              .productosMasVendidos
              .map(
                (
                  producto,
                  index
                ) => (

                  <div
                    key={index}
                    style={{
                      marginTop: 20,
                    }}
                  >

                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        gap: 12,
                      }}
                    >

                      <span>
                        {index + 1}.{' '}
                        {
                          producto.nombre
                        }
                      </span>

                      <strong>
                        {
                          producto.cantidad
                        }{' '}
                        u.
                      </strong>

                    </div>

                    <div
                      style={{
                        height: 10,
                        background:
                          '#30303a',
                        marginTop: 8,
                        borderRadius: 10,
                        overflow:
                          'hidden',
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${
                              (
                                producto.cantidad /
                                maxProducto
                              ) * 100
                            }%`,
                          height:
                            '100%',
                          background:
                            '#9333ea',
                        }}
                      />

                    </div>

                    <small
                      style={{
                        color:
                          '#a1a1aa',
                      }}
                    >
                      $
                      {formatearPrecio(
                        producto.ingresos
                      )}{' '}
                      generados
                    </small>

                  </div>

                )
              )

          ) : (

            <p>
              Todavía no hay
              productos vendidos.
            </p>

          )}

        </div>

      </div>

      {/* =====================
          MÉTODOS DE PAGO
      ====================== */}

      <div
        className="inventory-card"
        style={{
          marginBottom: 24,
        }}
      >

        <div style={{ padding: 20 }}>

          <h2>
            💳 Ventas por método de pago
          </h2>

          {estadisticas
            .ventasPorMetodo
            .length > 0 ? (

            estadisticas
              .ventasPorMetodo
              .map(
                (metodo) => (

                  <div
                    key={
                      metodo.metodo
                    }
                    style={{
                      marginTop: 20,
                    }}
                  >

                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                      }}
                    >

                      <span>
                        {
                          metodo.metodo
                        }
                      </span>

                      <strong>
                        $
                        {formatearPrecio(
                          metodo.total
                        )}
                      </strong>

                    </div>

                    <div
                      style={{
                        height: 10,
                        background:
                          '#30303a',
                        marginTop: 8,
                        borderRadius: 10,
                        overflow:
                          'hidden',
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${
                              (
                                metodo.total /
                                maxMetodo
                              ) * 100
                            }%`,
                          height:
                            '100%',
                          background:
                            '#22c55e',
                        }}
                      />

                    </div>

                    <small
                      style={{
                        color:
                          '#a1a1aa',
                      }}
                    >
                      {
                        metodo.cantidad
                      }{' '}
                      ventas
                    </small>

                  </div>

                )
              )

          ) : (

            <p>
              Todavía no hay
              métodos de pago
              registrados.
            </p>

          )}

        </div>

      </div>

      {/* =====================
          VENTAS POR HORA
      ====================== */}

      <div className="inventory-card">

        <div style={{ padding: 20 }}>

          <h2>
            📊 Ventas por hora
          </h2>

          {estadisticas
            .ventasPorHora
            .length > 0 ? (

            estadisticas
              .ventasPorHora
              .map(
                (hora) => (

                  <div
                    key={hora.hora}
                    style={{
                      marginTop: 20,
                    }}
                  >

                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                      }}
                    >

                      <span>
                        {hora.hora}
                      </span>

                      <strong>
                        $
                        {formatearPrecio(
                          hora.ingresos
                        )}
                      </strong>

                    </div>

                    <div
                      style={{
                        height: 10,
                        background:
                          '#30303a',
                        marginTop: 8,
                        borderRadius: 10,
                        overflow:
                          'hidden',
                      }}
                    >

                      <div
                        style={{
                          width:
                            `${
                              (
                                hora.ingresos /
                                maxHora
                              ) * 100
                            }%`,
                          height:
                            '100%',
                          background:
                            '#a855f7',
                        }}
                      />

                    </div>

                    <small
                      style={{
                        color:
                          '#a1a1aa',
                      }}
                    >
                      {
                        hora.cantidadVentas
                      }{' '}
                      ventas
                    </small>

                  </div>

                )
              )

          ) : (

            <p>
              Todavía no hay
              ventas registradas.
            </p>

          )}

        </div>

      </div>

    </div>
  )
}

export default Estadisticas