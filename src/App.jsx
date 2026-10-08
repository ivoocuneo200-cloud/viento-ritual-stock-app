import {
  Routes,
  Route,
} from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Ventas from './pages/Ventas'
import Movimientos from './pages/Movimientos'
import Estadisticas from './pages/Estadisticas'
import Eventos from './pages/Eventos'
import Administracion from './pages/Administracion'
import Login from './pages/Login'

function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* APP PROTEGIDA */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        {/* RESUMEN */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* VENTAS */}
        <Route
          path="/ventas"
          element={
            <ProtectedRoute
              roles={[
                'admin',
                'vendedor',
              ]}
            >
              <Ventas />
            </ProtectedRoute>
          }
        />

        {/* INVENTARIO */}
        <Route
          path="/inventario"
          element={
            <ProtectedRoute
              roles={[
                'admin',
                'stock',
              ]}
            >
              <Inventario />
            </ProtectedRoute>
          }
        />

        {/* MOVIMIENTOS */}
        <Route
          path="/movimientos"
          element={
            <ProtectedRoute
              roles={[
                'admin',
                'stock',
              ]}
            >
              <Movimientos />
            </ProtectedRoute>
          }
        />

        {/* ESTADÍSTICAS */}
        <Route
          path="/estadisticas"
          element={
            <ProtectedRoute
              roles={[
                'admin',
                'stock',
                'vendedor',
              ]}
            >
              <Estadisticas />
            </ProtectedRoute>
          }
        />

        {/* EVENTOS */}
        <Route
          path="/eventos"
          element={
            <ProtectedRoute
              roles={[
                'admin',
              ]}
            >
              <Eventos />
            </ProtectedRoute>
          }
        />

        {/* ADMINISTRACIÓN */}
        <Route
          path="/administracion"
          element={
            <ProtectedRoute
              roles={[
                'admin',
              ]}
            >
              <Administracion />
            </ProtectedRoute>
          }
        />

      </Route>

    </Routes>
  )
}

export default App