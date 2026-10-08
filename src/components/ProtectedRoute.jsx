import {
  Navigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

function ProtectedRoute({
  children,
  roles,
}) {
  const {
    usuario,
    perfil,
    cargandoAuth,
  } = useAuth()

  if (cargandoAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#09090b',
          color: 'white',
        }}
      >
        Cargando...
      </div>
    )
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    roles &&
    !perfil
  ) {
    return (
      <div
        style={{
          padding: 40,
        }}
      >
        Cargando perfil...
      </div>
    )
  }

  if (
    roles &&
    !roles.includes(
      perfil.rol
    )
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute