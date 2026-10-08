import { supabase } from './supabase'

export const obtenerUsuarios = async () => {
  const { data, error } =
    await supabase.rpc(
      'admin_listar_usuarios'
    )

  if (error) {
    throw error
  }

  return data || []
}

export const cambiarRolUsuario = async (
  usuarioId,
  nuevoRol
) => {
  const { error } =
    await supabase.rpc(
      'admin_cambiar_rol',
      {
        p_usuario_id:
          usuarioId,

        p_nuevo_rol:
          nuevoRol,
      }
    )

  if (error) {
    throw error
  }

  return true
}

export const crearUsuario = async ({
  nombre,
  email,
  password,
  rol,
}) => {
  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      'crear-usuario',
      {
        body: {
          nombre,
          email,
          password,
          rol,
        },
      }
    )

  if (error) {
    console.error(
      'Error Edge Function:',
      error
    )

    if (
      error.context instanceof Response
    ) {
      try {
        const respuesta =
          await error.context.json()

        throw new Error(
          respuesta.error ||
          error.message
        )
      } catch (errorLectura) {
        if (
          errorLectura instanceof Error &&
          errorLectura.message !==
            error.message
        ) {
          throw errorLectura
        }
      }
    }

    throw error
  }

  if (data?.error) {
    throw new Error(
      data.error
    )
  }

  return data
}
export const eliminarUsuario = async (
  usuarioId
) => {
  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      'eliminar-usuario',
      {
        body: {
          usuarioId,
        },
      }
    )

  if (error) {
    console.error(
      'Error Edge Function:',
      error
    )

    if (
      error.context instanceof Response
    ) {
      try {
        const respuesta =
          await error.context.json()

        if (respuesta?.error) {
          throw new Error(
            respuesta.error
          )
        }
      } catch (errorLectura) {
        if (
          errorLectura instanceof Error
        ) {
          throw errorLectura
        }
      }
    }

    throw error
  }

  if (data?.error) {
    throw new Error(
      data.error
    )
  }

  return true
}