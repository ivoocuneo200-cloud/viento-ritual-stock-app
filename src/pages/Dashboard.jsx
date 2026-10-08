
import { useEffect, useState } from 'react'
import { obtenerResumenEvento } from '../services/dashboardService'

function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarResumen = async () => {
    setCargando(true)
    setError('')

    try {
      const eventoId = Number(
        localStorage.getItem('eventoActualId')
      )

      if (!eventoId) {
        setResumen(null)
        setError('Seleccioná un evento para ver su resumen.')
        return
      }

      const datos = await obtenerResumenEvento(eventoId)
      setResumen(datos)
    } catch (err) {
      console.error('Error cargando resumen:', err)
      setError(err.message || 'No se pudo cargar el resumen.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarResumen()
  }, [])

  const moneda = (numero) =>
    '$' + Number(numero || 0).toLocaleString('es-AR', {
      maximumFractionDigits: 2,
    })

  const numero = (valor) =>
    Number(valor || 0).toLocaleString('es-AR')

  const panel = {
    background: '#18181f',
    border: '1px solid #30303a',
    borderRadius: 14,
    padding: 20,
  }

  const etiqueta = {
    color: '#a1a1aa',
    fontSize: 14,
  }

  const barraFondo = {
    height: 10,
    background: '#30303a',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  }

  if (cargando) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Resumen</h1>
        <p>Cargando datos de Supabase...</p>
      </div>
    )
  }

  if (error || !resumen) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Resumen</h1>
        <p>{error || 'No hay datos disponibles.'}</p>
        <button
          className="primary-button"
          onClick={cargarResumen}
        >
          Reintentar
        </button>
      </div>
    )
  }

  const tarjetas = [
    {
      titulo: 'Bebidas disponibles',
      valor: numero(resumen.unidadesDisponibles),
      detalle: 'Unidades en inventario',
      icono: '🍺',
    },
    {
      titulo: 'Unidades vendidas',
      valor: numero(resumen.unidadesVendidas),
      detalle: `${resumen.cantidadVentas} ventas registradas`,
      icono: '🛒',
    },
    {
      titulo: 'Ingresos',
      valor: moneda(resumen.ingresos),
      detalle: 'Total vendido',
      icono: '💵',
    },
    {
      titulo: 'Costo del stock',
      valor: moneda(resumen.costoStock),
      detalle: 'Valor al costo del inventario restante',
      icono: '📦',
    },
    {
      titulo: 'Costo de lo vendido',
      valor: moneda(resumen.costoVendido),
      detalle: 'Costo estimado de bebidas vendidas',
      icono: '🧾',
    },
    {
      titulo: 'Ganancia estimada',
      valor: moneda(resumen.gananciaEstimada),
      detalle: 'Ingresos menos costo vendido',
      icono: '📈',
    },
  ]

  const maxStock = Math.max(
    1,
    ...resumen.stockPorCategoria.map((x) => x.cantidad)
  )

  const maxTop = Math.max(
    1,
    ...resumen.topVendidos.map((x) => x.cantidad)
  )

  const maxIngresos = Math.max(
    1,
    ...resumen.ventasPorHora.map((x) => x.total)
  )

  return (
    <div style={{ padding: '8px 0 32px' }}>

      {/* ENCABEZADO */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 8 }}>Resumen</h1>
          <p style={{ color: '#a1a1aa', margin: 0 }}>
            Estado general del evento
          </p>
        </div>

        <button
          className="primary-button"
          onClick={cargarResumen}
        >
          ↻ Actualizar datos
        </button>
      </div>

      {/* EVENTO ACTUAL */}

      <div
        style={{
          ...panel,
          marginBottom: 24,
          borderLeft: '4px solid #9333ea',
        }}
      >
        <span style={etiqueta}>EVENTO SELECCIONADO</span>
        <h2 style={{ margin: '10px 0 6px' }}>
          🎉 {resumen.evento?.nombre}
        </h2>
        <span style={{ color: '#c4b5fd' }}>
          {resumen.evento?.estado}
        </span>
      </div>

      {/* TARJETAS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {tarjetas.map((tarjeta) => (
          <div key={tarjeta.titulo} style={panel}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={etiqueta}>{tarjeta.titulo}</span>
              <span style={{ fontSize: 24 }}>
                {tarjeta.icono}
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(23px, 3vw, 30px)',
                margin: '14px 0 8px',
                overflowWrap: 'anywhere',
              }}
            >
              {tarjeta.valor}
            </h2>

            <p style={{ ...etiqueta, margin: 0 }}>
              {tarjeta.detalle}
            </p>
          </div>
        ))}
      </div>

      {/* GRÁFICOS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 20,
          marginBottom: 24,
        }}
      >

        {/* STOCK POR CATEGORÍA */}

        <div style={panel}>
          <h2 style={{ fontSize: 19, marginBottom: 20 }}>
            📦 Stock por categoría
          </h2>

          {resumen.stockPorCategoria.length === 0 ? (
            <p style={etiqueta}>Sin productos registrados.</p>
          ) : (
            resumen.stockPorCategoria.map((item) => (
              <div
                key={item.nombre}
                style={{ marginBottom: 20 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span>{item.nombre}</span>
                  <strong>{numero(item.cantidad)}</strong>
                </div>

                <div style={barraFondo}>
                  <div
                    style={{
                      background: '#9333ea',
                      width: `${(item.cantidad / maxStock) * 100}%`,
                      height: '100%',
                      borderRadius: 10,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* TOP PRODUCTOS */}

        <div style={panel}>
          <h2 style={{ fontSize: 19, marginBottom: 20 }}>
            🏆 Bebidas más vendidas
          </h2>

          {resumen.topVendidos.length === 0 ? (
            <p style={etiqueta}>
              Todavía no hay ventas registradas.
            </p>
          ) : (
            resumen.topVendidos.map((item, index) => (
              <div
                key={index}
                style={{ marginBottom: 20 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span>{item.nombre}</span>
                  <strong>{numero(item.cantidad)}</strong>
                </div>

                <div style={barraFondo}>
                  <div
                    style={{
                      background: '#22c55e',
                      width: `${(item.cantidad / maxTop) * 100}%`,
                      height: '100%',
                      borderRadius: 10,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* INGRESOS POR HORA */}

      <div style={{ ...panel, marginBottom: 24 }}>
        <h2 style={{ fontSize: 19, marginBottom: 20 }}>
          💵 Ingresos por hora
        </h2>

        {resumen.ventasPorHora.length === 0 ? (
          <p style={etiqueta}>
            Todavía no hay ingresos registrados.
          </p>
        ) : (
          resumen.ventasPorHora.map((item) => (
            <div
              key={item.hora}
              style={{ marginBottom: 16 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span>{item.hora}</span>
                <strong>{moneda(item.total)}</strong>
              </div>

              <div style={barraFondo}>
                <div
                  style={{
                    background: '#a855f7',
                    width: `${(item.total / maxIngresos) * 100}%`,
                    height: '100%',
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ÚLTIMOS MOVIMIENTOS */}

      <div style={panel}>
        <h2 style={{ fontSize: 19, marginBottom: 20 }}>
          📋 Últimos movimientos
        </h2>

        {resumen.movimientos.length === 0 ? (
          <p style={etiqueta}>
            Todavía no hay movimientos.
          </p>
        ) : (
          resumen.movimientos.map((movimiento) => (
            <div
              key={movimiento.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: '1px solid #30303a',
                padding: '14px 0',
              }}
            >
              <div>
                <strong>
                  {movimiento.productos?.nombre ||
                    'Producto desconocido'}
                </strong>

                <p
                  style={{
                    ...etiqueta,
                    margin: '6px 0 0',
                  }}
                >
                  {movimiento.motivo} ·{' '}
                  {new Date(
                    movimiento.created_at
                  ).toLocaleString('es-AR')}
                </p>
              </div>

              <strong
                style={{
                  color:
                    movimiento.tipo === 'entrada'
                      ? '#22c55e'
                      : '#f87171',
                }}
              >
                {movimiento.tipo === 'entrada'
                  ? '+'
                  : '-'}
                {movimiento.cantidad}
              </strong>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default Dashboard
