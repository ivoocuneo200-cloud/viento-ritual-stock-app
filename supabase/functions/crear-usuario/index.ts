import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function responder(
  body: unknown,
  status = 200
) {
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
            'Faltan variables de Supabase en la Edge Function',
        },
        500
      )
    }

    // =====================================
    // SESIÓN DEL USUARIO ACTUAL
    // =====================================

    const authorization =
      req.headers.get('Authorization')

    if (!authorization) {
      return responder(
        {
          error:
            'No se recibió la sesión del usuario',
        },
        401
      )
    }

    // Cliente que actúa como el usuario
    // que está logueado en la aplicación.
    const supabaseUsuario =
      createClient(
        supabaseUrl,
        anonKey,
        {
          global: {
            headers: {
              Authorization:
                authorization,
            },
          },
          auth: {
            persistSession: false,
          },
        }
      )

    // =====================================
    // VERIFICAR USUARIO
    // =====================================

    const {
      data: usuarioData,
      error: usuarioError,
    } =
      await supabaseUsuario.auth
        .getUser()

    if (
      usuarioError ||
      !usuarioData.user
    ) {
      console.error(
        'Error usuario:',
        usuarioError
      )

      return responder(
        {
          error:
            'La sesión no es válida',
        },
        401
      )
    }

    const usuarioActual =
      usuarioData.user

    // =====================================
    // LEER PERFIL DEL USUARIO
    // =====================================

    const {
      data: perfil,
      error: perfilError,
    } =
      await supabaseUsuario
        .from('perfiles')
        .select(
          'id, nombre, rol'
        )
        .eq(
          'id',
          usuarioActual.id
        )
        .single()

    if (perfilError) {
      console.error(
        'ERROR PERFIL:',
        perfilError
      )

      return responder(
        {
          error:
            `Error leyendo perfil: ${perfilError.message}`,
        },
        403
      )
    }

    if (!perfil) {
      return responder(
        {
          error:
            'El usuario no tiene un perfil',
        },
        403
      )
    }

    if (perfil.rol !== 'admin') {
      return responder(
        {
          error:
            `No tiene permisos de administrador. Rol actual: ${perfil.rol}`,
        },
        403
      )
    }

    // =====================================
    // CLIENTE ADMINISTRATIVO
    // =====================================

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

    // =====================================
    // DATOS DEL NUEVO USUARIO
    // =====================================

    const {
      nombre,
      email,
      password,
      rol,
    } = await req.json()

    if (
      !nombre?.trim() ||
      !email?.trim() ||
      !password ||
      !rol
    ) {
      return responder(
        {
          error:
            'Nombre, email, contraseña y rol son obligatorios',
        },
        400
      )
    }

    if (password.length < 6) {
      return responder(
        {
          error:
            'La contraseña debe tener al menos 6 caracteres',
        },
        400
      )
    }

    if (
      ![
        'admin',
        'stock',
        'vendedor',
      ].includes(rol)
    ) {
      return responder(
        {
          error:
            'Rol inválido',
        },
        400
      )
    }

    // =====================================
    // CREAR USUARIO EN AUTH
    // =====================================

    const {
      data: usuarioCreado,
      error: crearError,
    } =
      await supabaseAdmin
        .auth.admin
        .createUser({
          email:
            email
              .trim()
              .toLowerCase(),

          password,

          email_confirm: true,

          user_metadata: {
            nombre:
              nombre.trim(),
          },
        })

    if (
      crearError ||
      !usuarioCreado.user
    ) {
      console.error(
        'ERROR AUTH:',
        crearError
      )

      return responder(
        {
          error:
            crearError?.message ||
            'No se pudo crear el usuario',
        },
        400
      )
    }

    const nuevoUsuarioId =
      usuarioCreado.user.id

    // =====================================
    // PERFIL
    // =====================================

    const {
      error: nuevoPerfilError,
    } =
      await supabaseAdmin
        .from('perfiles')
        .upsert({
          id:
            nuevoUsuarioId,

          nombre:
            nombre.trim(),

          rol,
        })

    if (nuevoPerfilError) {
      console.error(
        'ERROR NUEVO PERFIL:',
        nuevoPerfilError
      )

      await supabaseAdmin
        .auth.admin
        .deleteUser(
          nuevoUsuarioId
        )

      return responder(
        {
          error:
            `No se pudo crear el perfil: ${nuevoPerfilError.message}`,
        },
        500
      )
    }

    return responder({
      ok: true,

      usuario: {
        id:
          nuevoUsuarioId,

        nombre:
          nombre.trim(),

        email:
          usuarioCreado.user.email,

        rol,
      },
    })

  } catch (error) {
    console.error(
      'ERROR GENERAL:',
      error
    )

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