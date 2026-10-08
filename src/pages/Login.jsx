import { useState } from 'react'
import {
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import logoViento from '../assets/logo-viento.png'

function Login() {
  const navigate = useNavigate()

  const {
    usuario,
    iniciarSesion,
  } = useAuth()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [cargando, setCargando] =
    useState(false)

  const [error, setError] =
    useState('')

  if (usuario) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  const manejarLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError(
        'Ingresá email y contraseña.'
      )

      return
    }

    try {
      setCargando(true)
      setError('')

      await iniciarSesion(
        email,
        password
      )

      navigate('/')

    } catch (error) {
      console.error(
        'Error al iniciar sesión:',
        error
      )

      setError(
        'Email o contraseña incorrectos.'
      )

    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: '#09090b',
      }}
    >

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          background: '#18181b',
          border:
            '1px solid #27272a',
          borderRadius: 18,
        }}
      >

<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  }}
>
  <img
    src={logoViento}
    alt="Logo Viento Ritual"
    style={{
      width: 48,
      height: 48,
      objectFit: 'contain',
      flexShrink: 0,
    }}
  />

  <div>
    <h1
      style={{
        margin: 0,
        lineHeight: 1.1,
      }}
    >
      Viento Ritual
    </h1>

    <p
      style={{
        color: '#a1a1aa',
        margin: '6px 0 0',
      }}
    >
      Stock App
    </p>
  </div>
</div>

        <form
          onSubmit={manejarLogin}
        >

          <div
            className="form-group"
          >

            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="usuario@email.com"
              autoComplete="email"
            />

          </div>

          <div
            className="form-group"
          >

            <label>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="••••••••"
              autoComplete="current-password"
            />

          </div>

          {error && (

            <div
              style={{
                marginTop: 16,
                padding: 12,
                background:
                  'rgba(239,68,68,.1)',
                border:
                  '1px solid rgba(239,68,68,.4)',
                borderRadius: 8,
                color: '#f87171',
              }}
            >
              {error}
            </div>

          )}

          <button
            type="submit"
            className="primary-button"
            disabled={cargando}
            style={{
              width: '100%',
              marginTop: 22,
            }}
          >

            {cargando
              ? 'Ingresando...'
              : 'Iniciar sesión'}

          </button>

        </form>

      </div>

    </div>
  )
}

export default Login