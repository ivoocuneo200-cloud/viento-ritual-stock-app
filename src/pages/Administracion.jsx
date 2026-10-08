import {
  useEffect,
  useState,
} from 'react'

import {
  obtenerUsuarios,
  cambiarRolUsuario,
  crearUsuario,
  eliminarUsuario,
} from '../services/administracionService'

import { useAuth } from '../context/AuthContext'

function Administracion() {
  const { usuario } = useAuth()

  const [usuarios, setUsuarios] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [
    actualizandoUsuario,
    setActualizandoUsuario,
  ] = useState(null)

  const [
    mostrarCrearUsuario,
    setMostrarCrearUsuario,
  ] = useState(false)

  const [
    guardandoUsuario,
    setGuardandoUsuario,
  ] = useState(false)

  const [
    nuevoUsuario,
    setNuevoUsuario,
  ] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'vendedor',
  })

  // =========================
  // CARGAR USUARIOS
  // =========================

  const cargarUsuarios = async () => {
    try {
      setCargando(true)

      const data =
        await obtenerUsuarios()

      setUsuarios(data)

    } catch (error) {
      console.error(
        'Error cargando usuarios:',
        error
      )

      alert(
        error.message ||
          'No se pudieron cargar los usuarios.'
      )

    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  // =========================
  // CAMBIAR ROL
  // =========================

  const cambiarRol = async (
    usuarioId,
    nuevoRol
  ) => {
    try {
      setActualizandoUsuario(
        usuarioId
      )

      await cambiarRolUsuario(
        usuarioId,
        nuevoRol
      )

      await cargarUsuarios()

    } catch (error) {
      console.error(
        'Error cambiando rol:',
        error
      )

      alert(
        error.message ||
          'No se pudo cambiar el rol.'
      )

    } finally {
      setActualizandoUsuario(null)
    }
  }

  // =========================
  // CREAR USUARIO
  // =========================

  const guardarNuevoUsuario =
    async (e) => {
      e.preventDefault()

      if (
        !nuevoUsuario.nombre.trim() ||
        !nuevoUsuario.email.trim() ||
        !nuevoUsuario.password
      ) {
        alert(
          'Completá todos los campos.'
        )

        return
      }

      if (
        nuevoUsuario.password.length < 6
      ) {
        alert(
          'La contraseña debe tener al menos 6 caracteres.'
        )

        return
      }

      try {
        setGuardandoUsuario(true)

        await crearUsuario({
          nombre:
            nuevoUsuario.nombre.trim(),

          email:
            nuevoUsuario.email
              .trim()
              .toLowerCase(),

          password:
            nuevoUsuario.password,

          rol:
            nuevoUsuario.rol,
        })

        setNuevoUsuario({
          nombre: '',
          email: '',
          password: '',
          rol: 'vendedor',
        })

        setMostrarCrearUsuario(false)

        await cargarUsuarios()

        alert(
          'Usuario creado correctamente.'
        )

      } catch (error) {
        console.error(
          'Error creando usuario:',
          error
        )

        alert(
          error.message ||
            'No se pudo crear el usuario.'
        )

      } finally {
        setGuardandoUsuario(false)
      }
    }

  // =========================
  // ELIMINAR USUARIO
  // =========================

  const borrarUsuario = async (
    usuarioEliminar
  ) => {
    const confirmar =
      window.confirm(
        `¿Seguro que querés eliminar a "${usuarioEliminar.nombre}"?\n\nEsta acción no se puede deshacer.`
      )

    if (!confirmar) {
      return
    }

    try {
      await eliminarUsuario(
        usuarioEliminar.id
      )

      await cargarUsuarios()

      alert(
        'Usuario eliminado correctamente.'
      )

    } catch (error) {
      console.error(
        'Error eliminando usuario:',
        error
      )

      alert(
        error.message ||
          'No se pudo eliminar el usuario.'
      )
    }
  }

  // =========================
  // LOADING
  // =========================

  if (cargando) {
    return (
      <div>
        <h1>Administración</h1>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  // =========================
  // INTERFAZ
  // =========================

  return (
    <div>

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Administración
          </h1>

          <p>
            Gestión de usuarios y permisos.
          </p>

        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >

          <button
            className="primary-button"
            onClick={() =>
              setMostrarCrearUsuario(
                true
              )
            }
          >
            + Crear usuario
          </button>

          <button
            className="secondary-button"
            onClick={cargarUsuarios}
          >
            ↻ Actualizar
          </button>

        </div>

      </div>

      {/* INFORMACIÓN */}

      <div
        className="inventory-card"
        style={{
          marginBottom: 20,
        }}
      >

        <div
          style={{
            padding: 20,
          }}
        >

          <h2>
            👥 Usuarios
          </h2>

          <p
            style={{
              color: '#a1a1aa',
            }}
          >
            Desde acá podés definir qué
            puede hacer cada integrante
            del equipo.
          </p>

        </div>

      </div>

      {/* TABLA */}

      <div className="inventory-card">

        <div className="inventory-table-wrapper">

          <table className="inventory-table">

            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha de alta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {usuarios.length > 0 ? (

                usuarios.map((item) => {

                  const esUsuarioActual =
                    item.id === usuario?.id

                  return (
                    <tr key={item.id}>

                      <td>

                        <strong>
                          {item.nombre ||
                            'Sin nombre'}
                        </strong>

                        {esUsuarioActual && (
                          <div
                            style={{
                              fontSize: 12,
                              color: '#a855f7',
                              marginTop: 4,
                            }}
                          >
                            Tu cuenta
                          </div>
                        )}

                      </td>

                      <td>
                        {item.email}
                      </td>

                      <td>

                        <select
                          value={item.rol}
                          disabled={
                            actualizandoUsuario ===
                              item.id ||
                            esUsuarioActual
                          }
                          onChange={(e) =>
                            cambiarRol(
                              item.id,
                              e.target.value
                            )
                          }
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: '#18181b',
                            color: 'white',
                            border:
                              '1px solid #3f3f46',
                          }}
                        >

                          <option value="admin">
                            Administrador
                          </option>

                          <option value="stock">
                            Stock
                          </option>

                          <option value="vendedor">
                            Vendedor
                          </option>

                        </select>

                      </td>

                      <td>
                        {new Date(
                          item.created_at
                        ).toLocaleDateString(
                          'es-AR'
                        )}
                      </td>

                      <td>

                        <span
                          style={{
                            display:
                              'inline-block',
                            padding:
                              '5px 9px',
                            borderRadius: 20,
                            background:
                              'rgba(34,197,94,.12)',
                            color:
                              '#4ade80',
                            fontSize: 13,
                          }}
                        >
                          Activo
                        </span>

                      </td>

                      <td>

                        {!esUsuarioActual ? (

                          <button
                            onClick={() =>
                              borrarUsuario(item)
                            }
                            style={{
                              padding:
                                '8px 12px',
                              borderRadius: 8,
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

                        ) : (

                          <span
                            style={{
                              color:
                                '#71717a',
                              fontSize: 13,
                            }}
                          >
                            Tu cuenta
                          </span>

                        )}

                      </td>

                    </tr>
                  )
                })

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-table-message"
                  >
                    No hay usuarios registrados.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ROLES */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 24,
        }}
      >

        <div className="inventory-card">

          <div style={{ padding: 20 }}>

            <h3>
              👑 Administrador
            </h3>

            <p
              style={{
                color: '#a1a1aa',
              }}
            >
              Puede administrar eventos,
              stock, ventas, estadísticas
              y usuarios.
            </p>

          </div>

        </div>

        <div className="inventory-card">

          <div style={{ padding: 20 }}>

            <h3>
              📦 Stock
            </h3>

            <p
              style={{
                color: '#a1a1aa',
              }}
            >
              Puede controlar productos,
              inventario y movimientos.
            </p>

          </div>

        </div>

        <div className="inventory-card">

          <div style={{ padding: 20 }}>

            <h3>
              💵 Vendedor
            </h3>

            <p
              style={{
                color: '#a1a1aa',
              }}
            >
              Puede registrar ventas y
              consultar información del
              evento.
            </p>

          </div>

        </div>

      </div>

      {/* =========================
          MODAL CREAR USUARIO
      ========================= */}

      {mostrarCrearUsuario && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <h2>
                  Crear usuario
                </h2>

                <p>
                  Creá una cuenta para
                  un integrante del equipo.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setMostrarCrearUsuario(
                    false
                  )
                }
              >
                ✕
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={
                guardarNuevoUsuario
              }
            >

              {/* NOMBRE */}

              <div className="form-group">

                <label>
                  Nombre
                </label>

                <input
                  type="text"
                  value={
                    nuevoUsuario.nombre
                  }
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      nombre:
                        e.target.value,
                    })
                  }
                  placeholder="Ej: Juan Pérez"
                />

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={
                    nuevoUsuario.email
                  }
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      email:
                        e.target.value,
                    })
                  }
                  placeholder="juan@email.com"
                />

              </div>

              {/* CONTRASEÑA */}

              <div className="form-group">

                <label>
                  Contraseña inicial
                </label>

                <input
                  type="password"
                  value={
                    nuevoUsuario.password
                  }
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      password:
                        e.target.value,
                    })
                  }
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />

              </div>

              {/* ROL */}

              <div className="form-group">

                <label>
                  Rol
                </label>

                <select
                  value={
                    nuevoUsuario.rol
                  }
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      rol:
                        e.target.value,
                    })
                  }
                >

                  <option value="vendedor">
                    Vendedor
                  </option>

                  <option value="stock">
                    Stock
                  </option>

                  <option value="admin">
                    Administrador
                  </option>

                </select>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setMostrarCrearUsuario(
                      false
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    guardandoUsuario
                  }
                >

                  {guardandoUsuario
                    ? 'Creando...'
                    : 'Crear usuario'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default Administracion