import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] =
    useState(null)

  const [perfil, setPerfil] =
    useState(null)

  const [
    cargandoAuth,
    setCargandoAuth,
  ] = useState(true)

  const cargarPerfil =
    async (usuarioId) => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', usuarioId)
          .single()

        if (error) {
          throw error
        }

        setPerfil(data)

      } catch (error) {
        console.error(
          'Error al cargar perfil:',
          error
        )

        setPerfil(null)
      }
    }

  useEffect(() => {
    let montado = true

    const iniciarAuth =
      async () => {
        try {
          const {
            data: {
              session,
            },
          } =
            await supabase.auth.getSession()

          if (!montado) {
            return
          }

          if (session?.user) {
            setUsuario(
              session.user
            )

            await cargarPerfil(
              session.user.id
            )
          } else {
            setUsuario(null)
            setPerfil(null)
          }

        } catch (error) {
          console.error(
            'Error iniciando autenticación:',
            error
          )

        } finally {
          if (montado) {
            setCargandoAuth(false)
          }
        }
      }

    iniciarAuth()

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_evento, session) => {

          const usuarioActual =
            session?.user || null

          setUsuario(
            usuarioActual
          )

          if (usuarioActual) {
            setTimeout(() => {
              cargarPerfil(
                usuarioActual.id
              )
            }, 0)
          } else {
            setPerfil(null)
          }

          setCargandoAuth(false)
        }
      )

    return () => {
      montado = false

      subscription.unsubscribe()
    }
  }, [])

  const iniciarSesion =
    async (
      email,
      password
    ) => {

      const {
        data,
        error,
      } =
        await supabase.auth
          .signInWithPassword({
            email,
            password,
          })

      if (error) {
        throw error
      }

      setUsuario(
        data.user
      )

      await cargarPerfil(
        data.user.id
      )

      return data
    }

  const cerrarSesion =
    async () => {

      const {
        error,
      } =
        await supabase.auth
          .signOut()

      if (error) {
        throw error
      }

      setUsuario(null)
      setPerfil(null)
    }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        cargandoAuth,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto =
    useContext(AuthContext)

  if (!contexto) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    )
  }

  return contexto
}