import { supabase } from './supabase'

export const obtenerInventarioEvento = async (eventoId) => {
  const { data, error } = await supabase
    .from('inventario_evento')
    .select(`
      id,
      stock,
      producto_id,
      productos (
        id,
        nombre,
        categoria,
        costo,
        precio,
        stock_minimo,
        activo
      )
    `)
    .eq('evento_id', eventoId)

  if (error) {
    throw error
  }

  return data.map((item) => ({
    inventarioId: item.id,
    id: item.productos.id,
    nombre: item.productos.nombre,
    categoria: item.productos.categoria,
    stock: item.stock,
    costo: Number(item.productos.costo),
    precio: Number(item.productos.precio),
    stockMinimo: item.productos.stock_minimo,
    activo: item.productos.activo,
  }))
}


export const registrarMovimientoSupabase = async ({
  eventoId,
  productoId,
  tipo,
  motivo,
  cantidad,
  observacion,
}) => {
  const { data, error } = await supabase.rpc(
    'registrar_movimiento_stock',
    {
      p_evento_id: eventoId,
      p_producto_id: productoId,
      p_tipo: tipo,
      p_motivo: motivo,
      p_cantidad: Number(cantidad),
      p_observacion: observacion || null,
      p_usuario: 'Administrador',
    }
  )

  if (error) {
    throw error
  }

  return data
}


export const obtenerMovimientosProducto = async (
  eventoId,
  productoId
) => {
  const { data, error } = await supabase
    .from('movimientos')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('producto_id', productoId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data
}


export const crearProductoSupabase = async ({
  eventoId,
  nombre,
  categoria,
  stock,
  costo,
  precio,
  stockMinimo,
}) => {
  const { data, error } = await supabase.rpc(
    'crear_producto_evento',
    {
      p_evento_id: eventoId,
      p_nombre: nombre,
      p_categoria: categoria,
      p_stock: Number(stock),
      p_costo: Number(costo),
      p_precio: Number(precio),
      p_stock_minimo: Number(stockMinimo),
    }
  )

  if (error) {
    throw error
  }

  return data
}


export const editarProductoSupabase = async ({
  id,
  nombre,
  categoria,
  costo,
  precio,
  stockMinimo,
}) => {
  const { error } = await supabase.rpc(
    'editar_producto',
    {
      p_producto_id: id,
      p_nombre: nombre,
      p_categoria: categoria,
      p_costo: Number(costo),
      p_precio: Number(precio),
      p_stock_minimo: Number(stockMinimo),
    }
  )

  if (error) {
    throw error
  }

  return true
}