import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import logoViento from '../assets/logo-viento.png'

function MainLayout() {
  const navigate = useNavigate()

  const {
    usuario,
    perfil,
    cerrarSesion,
  } = useAuth()

  const rol = perfil?.rol || ''
  const nombre =
    perfil?.nombre ||
    usuario?.email ||
    'Usuario'

  const puedeVerVentas =
    rol === 'admin' ||
    rol === 'vendedor'

  const puedeVerInventario =
    rol === 'admin' ||
    rol === 'stock'

  const puedeVerMovimientos =
    rol === 'admin' ||
    rol === 'stock'

  const puedeVerEstadisticas =
    rol === 'admin' ||
    rol === 'stock' ||
    rol === 'vendedor'

  const puedeVerEventos =
    rol === 'admin'

  const puedeVerAdministracion =
    rol === 'admin'

  const cerrarSesionUsuario = async () => {
    try {
      await cerrarSesion()
      navigate('/login')
    } catch (error) {
      console.error(
        'Error cerrando sesión:',
        error
      )

      alert(
        'No se pudo cerrar la sesión.'
      )
    }
  }

  const nombreRol = {
    admin: 'Administrador',
    stock: 'Stock',
    vendedor: 'Vendedor',
  }

  return (
    <div className="app-layout">

      <aside className="sidebar">

        {/* LOGO */}

<div className="sidebar-logo">

  <img
    src={logoViento}
    alt="Logo Viento Ritual"
    className="sidebar-brand-logo"
  />

  <div className="sidebar-brand-text">
    <h2>Viento Ritual</h2>
    <span>Stock App</span>
  </div>

</div>

        {/* NAVEGACIÓN */}

        <nav className="sidebar-nav">

          <NavLink to="/">
            🏠 Resumen
          </NavLink>

          {puedeVerVentas && (
            <NavLink to="/ventas">
              💵 Ventas
            </NavLink>
          )}

          {puedeVerInventario && (
            <NavLink to="/inventario">
              🍺 Inventario
            </NavLink>
          )}

          {puedeVerMovimientos && (
            <NavLink to="/movimientos">
              📦 Movimientos
            </NavLink>
          )}

          {puedeVerEstadisticas && (
            <NavLink to="/estadisticas">
              📊 Estadísticas
            </NavLink>
          )}

          {puedeVerEventos && (
            <NavLink to="/eventos">
              🎉 Eventos
            </NavLink>
          )}

          {puedeVerAdministracion && (
            <NavLink to="/administracion">
              ⚙️ Administración
            </NavLink>
          )}

        </nav>

        {/* USUARIO */}

        <div
          style={{
            marginTop: 'auto',
            padding: '18px 14px',
            borderTop:
              '1px solid #27272a',
          }}
        >

          <div
            style={{
              marginBottom: 14,
            }}
          >

            <div
              style={{
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {nombre}
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#a1a1aa',
              }}
            >
              {nombreRol[rol] || rol}
            </div>

          </div>

          <button
            onClick={
              cerrarSesionUsuario
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              background:
                '#27272a',
              border:
                '1px solid #3f3f46',
              color: 'white',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>

        </div>

      </aside>

      <main className="main-content">
        <Outlet />
      </main>

    </div>
  )
}

export default MainLayout