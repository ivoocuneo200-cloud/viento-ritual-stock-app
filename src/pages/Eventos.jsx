import { useEffect, useState } from 'react'

import {
  obtenerEventos,
  crearEventoSupabase,
  cerrarEventoSupabase,
  eliminarEventoSupabase,
} from '../services/eventosService'

function Eventos() {
  const [eventos, setEventos] = useState([])

  const [eventoActualId, setEventoActualId] =
    useState(() => {
      const guardado =
        localStorage.getItem(
          'eventoActualId'
        )

      return guardado
        ? Number(guardado)
        : null
    })

  const [mostrarModal, setMostrarModal] =
    useState(false)

  const [cargando, setCargando] =
    useState(true)

  const [nuevoEvento, setNuevoEvento] =
    useState({
      nombre: '',
      fecha: '',
      lugar: '',
    })

  // =========================
  // CARGAR EVENTOS
  // =========================

  const cargarEventos = async () => {
    try {
      setCargando(true)

      const data =
        await obtenerEventos()

      setEventos(data)

      const guardado =
        localStorage.getItem(
          'eventoActualId'
        )

      const idGuardado =
        guardado
          ? Number(guardado)
          : null

      const existeGuardado =
        data.some(
          (evento) =>
            evento.id === idGuardado
        )

      if (existeGuardado) {
        setEventoActualId(
          idGuardado
        )
      } else {
        const eventoActivo =
          data.find(
            (evento) =>
              evento.estado ===
              'Activo'
          )

        if (eventoActivo) {
          setEventoActualId(
            eventoActivo.id
          )

          localStorage.setItem(
            'eventoActualId',
            eventoActivo.id
          )
        } else if (
          data.length > 0
        ) {
          setEventoActualId(
            data[0].id
          )

          localStorage.setItem(
            'eventoActualId',
            data[0].id
          )
        } else {
          setEventoActualId(null)

          localStorage.removeItem(
            'eventoActualId'
          )
        }
      }

    } catch (error) {
      console.error(
        'Error al cargar eventos:',
        error
      )

      alert(
        'No se pudieron cargar los eventos.'
      )

    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarEventos()
  }, [])

  // =========================
  // FORMULARIO
  // =========================

  const manejarCambio = (e) => {
    const {
      name,
      value,
    } = e.target

    setNuevoEvento({
      ...nuevoEvento,
      [name]: value,
    })
  }

  // =========================
  // CREAR EVENTO
  // =========================

  const guardarEvento = async (e) => {
    e.preventDefault()

    if (
      !nuevoEvento.nombre.trim() ||
      !nuevoEvento.fecha ||
      !nuevoEvento.lugar.trim()
    ) {
      alert(
        'Completá todos los campos.'
      )

      return
    }

    try {
      const eventoCreado =
        await crearEventoSupabase({
          nombre:
            nuevoEvento.nombre.trim(),

          fecha:
            nuevoEvento.fecha,

          lugar:
            nuevoEvento.lugar.trim(),
        })

      setEventos(
        (eventosActuales) => [
          eventoCreado,
          ...eventosActuales,
        ]
      )

      setEventoActualId(
        eventoCreado.id
      )

      localStorage.setItem(
        'eventoActualId',
        eventoCreado.id
      )

      setNuevoEvento({
        nombre: '',
        fecha: '',
        lugar: '',
      })

      setMostrarModal(false)

    } catch (error) {
      console.error(
        'Error al crear evento:',
        error
      )

      alert(
        'No se pudo crear el evento.'
      )
    }
  }

  // =========================
  // CERRAR EVENTO
  // =========================

  const confirmarCierre =
    async (evento) => {

      const confirmar =
        window.confirm(
          `¿Querés cerrar "${evento.nombre}"?`
        )

      if (!confirmar) {
        return
      }

      try {
        const eventoActualizado =
          await cerrarEventoSupabase(
            evento.id
          )

        setEventos(
          (eventosActuales) =>
            eventosActuales.map(
              (item) =>
                item.id ===
                eventoActualizado.id
                  ? eventoActualizado
                  : item
            )
        )

      } catch (error) {
        console.error(
          'Error al cerrar evento:',
          error
        )

        alert(
          'No se pudo cerrar el evento.'
        )
      }
    }

  // =========================
  // ELIMINAR EVENTO
  // =========================

  const eliminarEvento =
    async (evento) => {

      if (
        evento.estado !==
        'Finalizado'
      ) {
        alert(
          'Solo se pueden eliminar eventos finalizados.'
        )

        return
      }

      const confirmar =
        window.confirm(
          `¿Seguro que querés eliminar "${evento.nombre}"?\n\nSe eliminará definitivamente el evento y toda la información asociada.\n\nEsta acción no se puede deshacer.`
        )

      if (!confirmar) {
        return
      }

      try {
        await eliminarEventoSupabase(
          evento.id
        )

        const eventoActualGuardado =
          Number(
            localStorage.getItem(
              'eventoActualId'
            )
          )

        if (
          eventoActualGuardado ===
          evento.id
        ) {
          localStorage.removeItem(
            'eventoActualId'
          )

          setEventoActualId(null)
        }

        await cargarEventos()

        alert(
          'Evento eliminado correctamente.'
        )

      } catch (error) {
        console.error(
          'Error eliminando evento:',
          error
        )

        alert(
          error.message ||
          'No se pudo eliminar el evento.'
        )
      }
    }

  // =========================
  // FORMATEAR FECHA
  // =========================

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return '-'
    }

    const [
      anio,
      mes,
      dia,
    ] = fecha.split('-')

    return `${dia}/${mes}/${anio}`
  }

  const eventoActual =
    eventos.find(
      (evento) =>
        evento.id ===
        eventoActualId
    ) || null

  // =========================
  // LOADING
  // =========================

  if (cargando) {
    return (
      <div className="events-page">

        <h1>
          Eventos
        </h1>

        <p>
          Cargando eventos...
        </p>

      </div>
    )
  }

  // =========================
  // INTERFAZ
  // =========================

  return (
    <div className="events-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Eventos
          </h1>

          <p>
            Administrá las distintas
            ediciones de Viento Ritual.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setMostrarModal(true)
          }
        >
          + Crear evento
        </button>

      </div>

      {/* EVENTO ACTUAL */}

      {eventoActual && (

        <section className="current-event-card">

          <div>

            <span className="current-event-label">
              EVENTO ACTUAL
            </span>

            <h2>
              {eventoActual.nombre}
            </h2>

            <p>
              {formatearFecha(
                eventoActual.fecha
              )}

              {' · '}

              {eventoActual.lugar}
            </p>

          </div>

          <span
            className={
              eventoActual.estado ===
              'Activo'
                ? 'event-status event-active'
                : 'event-status event-finished'
            }
          >
            {eventoActual.estado}
          </span>

        </section>

      )}

      {/* LISTA DE EVENTOS */}

      <section className="events-grid">

        {eventos.length > 0 ? (

          eventos.map((evento) => {

            const esActual =
              evento.id ===
              eventoActualId

            return (
              <article
                className={
                  esActual
                    ? 'event-card selected'
                    : 'event-card'
                }
                key={evento.id}
              >

                <div className="event-card-top">

                  <span
                    className={
                      evento.estado ===
                      'Activo'
                        ? 'event-status event-active'
                        : 'event-status event-finished'
                    }
                  >
                    {evento.estado}
                  </span>

                  {esActual && (

                    <span className="selected-event-badge">
                      Seleccionado
                    </span>

                  )}

                </div>

                <h3>
                  {evento.nombre}
                </h3>

                <div className="event-data">

                  <span>
                    📅{' '}
                    {formatearFecha(
                      evento.fecha
                    )}
                  </span>

                  <span>
                    📍 {evento.lugar}
                  </span>

                </div>

                {/* ACCIONES */}

                <div className="event-actions">

                  {!esActual && (

                    <button
                      className="secondary-button"
                      onClick={() => {
                        setEventoActualId(
                          evento.id
                        )

                        localStorage.setItem(
                          'eventoActualId',
                          evento.id
                        )
                      }}
                    >
                      Seleccionar
                    </button>

                  )}

                  {evento.estado ===
                    'Activo' && (

                    <button
                      className="danger-button"
                      onClick={() =>
                        confirmarCierre(
                          evento
                        )
                      }
                    >
                      Cerrar evento
                    </button>

                  )}

                  {evento.estado ===
                    'Finalizado' && (

                    <button
                      onClick={() =>
                        eliminarEvento(
                          evento
                        )
                      }
                      style={{
                        padding:
                          '8px 12px',

                        borderRadius:
                          8,

                        border:
                          '1px solid rgba(239,68,68,.45)',

                        background:
                          'rgba(239,68,68,.12)',

                        color:
                          '#f87171',

                        cursor:
                          'pointer',
                      }}
                    >
                      🗑 Eliminar
                    </button>

                  )}

                </div>

              </article>
            )
          })

        ) : (

          <div className="empty-dashboard">

            Todavía no hay
            eventos registrados.

          </div>

        )}

      </section>

      {/* =========================
          MODAL CREAR EVENTO
      ========================= */}

      {mostrarModal && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <h2>
                  Crear evento
                </h2>

                <p>
                  Registrá una nueva
                  edición de Viento Ritual.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setMostrarModal(false)
                }
              >
                ✕
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={
                guardarEvento
              }
            >

              <div className="form-group">

                <label>
                  Nombre del evento
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={
                    nuevoEvento.nombre
                  }
                  onChange={
                    manejarCambio
                  }
                  placeholder="Ej: Viento Ritual — Edición IV"
                />

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Fecha
                  </label>

                  <input
                    type="date"
                    name="fecha"
                    value={
                      nuevoEvento.fecha
                    }
                    onChange={
                      manejarCambio
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Lugar
                  </label>

                  <input
                    type="text"
                    name="lugar"
                    value={
                      nuevoEvento.lugar
                    }
                    onChange={
                      manejarCambio
                    }
                    placeholder="Ej: Neuquén"
                  />

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setMostrarModal(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Crear evento
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Eventos