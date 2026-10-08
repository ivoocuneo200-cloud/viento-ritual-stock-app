import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function responder(body: unknown, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    const supabaseUrl =
      Deno.env.get('SUPABASE_URL')

    const anonKey =
      Deno.env.get('SUPABASE_ANON_KEY')

    const serviceRoleKey =
      Deno.env.get(
        'SUPABASE_SERVICE_ROLE_KEY'
      )

    if (
      !supabaseUrl ||
      !anonKey ||
      !serviceRoleKey
    ) {
      return responder(
        {
          error:
            'Faltan variables de entorno de Supabase',
        },
        500
      )
    }

    const authorization =
      req.headers.get('Authorization')

    if (!authorization) {
      return responder(
        {
          error:
            'Debe iniciar sesión',
        },
        401
      )
    }

    // Cliente del usuario logueado
    const supabaseUsuario =
      createClient(
        supabaseUrl,
        anonKey,
        {
          global: {
            headers: {
              Authorization: authorization,
            },
          },
          auth: {
            persistSession: false,
          },
        }
      )

    const {
      data: usuarioData,
      error: usuarioError,
    } =
      await supabaseUsuario.auth.getUser()

    if (
      usuarioError ||
      !usuarioData.user
    ) {
      return responder(
        {
          error:
            'Sesión inválida',
        },
        401
      )
    }

    const usuarioActual =
      usuarioData.user

    // Comprobar que sea admin
    const {
      data: perfil,
      error: perfilError,
    } =
      await supabaseUsuario
        .from('perfiles')
        .select('rol')
        .eq('id', usuarioActual.id)
        .single()

    if (
      perfilError ||
      perfil?.rol !== 'admin'
    ) {
      return responder(
        {
          error:
            'No tiene permisos de administrador',
        },
        403
      )
    }

    const {
      usuarioId,
    } = await req.json()

    if (!usuarioId) {
      return responder(
        {
          error:
            'Falta el usuario a eliminar',
        },
        400
      )
    }

    // No permitir que el admin se borre solo
    if (
      usuarioId === usuarioActual.id
    ) {
      return responder(
        {
          error:
            'No puede eliminar su propia cuenta',
        },
        400
      )
    }

    // Cliente administrativo
    const supabaseAdmin =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

    const {
      error: eliminarError,
    } =
      await supabaseAdmin.auth.admin
        .deleteUser(usuarioId)

    if (eliminarError) {
      console.error(
        'Error eliminando usuario:',
        eliminarError
      )

      return responder(
        {
          error:
            eliminarError.message ||
            'No se pudo eliminar el usuario',
        },
        400
      )
    }

    return responder({
      ok: true,
    })

  } catch (error) {
    console.error(error)

    return responder(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error interno',
      },
      500
    )
  }
})
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