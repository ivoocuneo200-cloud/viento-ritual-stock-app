import { createContext, useContext, useState } from 'react'

const StockContext = createContext()

export function StockProvider({ children }) {
  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: 'Cerveza Quilmes 473ml',
      categoria: 'Cervezas',
      stock: 48,
      costo: 1200,
      precio: 2500,
      stockMinimo: 10,
    },
    {
      id: 2,
      nombre: 'Fernet Branca 750ml',
      categoria: 'Fernet',
      stock: 8,
      costo: 8500,
      precio: 12000,
      stockMinimo: 5,
    },
    {
      id: 3,
      nombre: 'Coca-Cola 2.25L',
      categoria: 'Gaseosas',
      stock: 15,
      costo: 2200,
      precio: 4000,
      stockMinimo: 6,
    },
    {
      id: 4,
      nombre: 'Vodka Smirnoff 750ml',
      categoria: 'Vodka',
      stock: 4,
      costo: 7000,
      precio: 11000,
      stockMinimo: 5,
    },
    {
      id: 5,
      nombre: 'Speed 473ml',
      categoria: 'Energizantes',
      stock: 0,
      costo: 900,
      precio: 2200,
      stockMinimo: 8,
    },
  ])

  const [movimientos, setMovimientos] = useState([])
  const [ventas, setVentas] = useState([])

  const [eventos, setEventos] = useState([
    {
      id: 1,
      nombre: 'Viento Ritual — Edición III',
      fecha: '2026-10-10',
      lugar: 'Neuquén',
      estado: 'Activo',
    },
  ])

  const [eventoActualId, setEventoActualId] = useState(() => {
  const guardado = localStorage.getItem('eventoActualId')

  return guardado ? Number(guardado) : 1
})

  const agregarProducto = (producto) => {
    setProductos((productosActuales) => [
      ...productosActuales,
      {
        ...producto,
        id: Date.now(),
      },
    ])
  }

  const editarProducto = (productoEditado) => {
    setProductos((productosActuales) =>
      productosActuales.map((producto) =>
        producto.id === productoEditado.id
          ? productoEditado
          : producto
      )
    )
  }

  const registrarMovimiento = ({
    productoId,
    tipo,
    motivo,
    cantidad,
    observacion,
  }) => {
    const producto = productos.find(
      (producto) => producto.id === productoId
    )

    if (!producto) {
      return {
        ok: false,
        mensaje: 'No se encontró el producto.',
      }
    }

    const cantidadNumero = Number(cantidad)

    if (!cantidadNumero || cantidadNumero <= 0) {
      return {
        ok: false,
        mensaje: 'Ingresá una cantidad válida.',
      }
    }

    if (
      tipo === 'salida' &&
      cantidadNumero > producto.stock
    ) {
      return {
        ok: false,
        mensaje: 'No hay suficiente stock disponible.',
      }
    }

    const stockAnterior = producto.stock

    const stockNuevo =
      tipo === 'entrada'
        ? stockAnterior + cantidadNumero
        : stockAnterior - cantidadNumero

    setProductos((productosActuales) =>
      productosActuales.map((item) =>
        item.id === productoId
          ? {
              ...item,
              stock: stockNuevo,
            }
          : item
      )
    )

    const ahora = new Date()

    const movimiento = {
      id: Date.now(),
      productoId: producto.id,
      producto: producto.nombre,
      tipo,
      motivo,
      cantidad: cantidadNumero,
      stockAnterior,
      stockNuevo,
      observacion,
      fecha: ahora.toLocaleDateString('es-AR'),
      hora: ahora.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      usuario: 'Administrador',
    }

    setMovimientos((movimientosActuales) => [
      movimiento,
      ...movimientosActuales,
    ])

    return {
      ok: true,
    }
  }

  const registrarVenta = ({
    items,
    metodoPago,
  }) => {
    if (!items || items.length === 0) {
      return {
        ok: false,
        mensaje: 'La venta no tiene productos.',
      }
    }

    for (const item of items) {
      const producto = productos.find(
        (producto) => producto.id === item.productoId
      )

      if (!producto) {
        return {
          ok: false,
          mensaje: 'Uno de los productos no existe.',
        }
      }

      if (item.cantidad > producto.stock) {
        return {
          ok: false,
          mensaje: `No hay suficiente stock de ${producto.nombre}.`,
        }
      }
    }

    const ahora = new Date()
    const ventaId = Date.now()

    const detalleVenta = items.map((item) => {
      const producto = productos.find(
        (producto) => producto.id === item.productoId
      )

      return {
        productoId: producto.id,
        producto: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * item.cantidad,
      }
    })

    const total = detalleVenta.reduce(
      (acumulador, item) =>
        acumulador + item.subtotal,
      0
    )

    let productosActualizados = [...productos]
    const nuevosMovimientos = []

    detalleVenta.forEach((item) => {
      const producto = productosActualizados.find(
        (producto) => producto.id === item.productoId
      )

      const stockAnterior = producto.stock
      const stockNuevo =
        stockAnterior - item.cantidad

      productosActualizados =
        productosActualizados.map((productoActual) =>
          productoActual.id === item.productoId
            ? {
                ...productoActual,
                stock: stockNuevo,
              }
            : productoActual
        )

      nuevosMovimientos.push({
        id: `${ventaId}-${item.productoId}`,
        productoId: producto.id,
        producto: producto.nombre,
        tipo: 'salida',
        motivo: 'Venta',
        cantidad: item.cantidad,
        stockAnterior,
        stockNuevo,
        observacion: `Venta #${ventaId}`,
        fecha: ahora.toLocaleDateString('es-AR'),
        hora: ahora.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        usuario: 'Administrador',
      })
    })

    setProductos(productosActualizados)

    setMovimientos((movimientosActuales) => [
      ...nuevosMovimientos,
      ...movimientosActuales,
    ])

    const venta = {
      id: ventaId,
      fecha: ahora.toLocaleDateString('es-AR'),
      hora: ahora.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: detalleVenta,
      total,
      metodoPago,
      usuario: 'Administrador',
    }

    setVentas((ventasActuales) => [
      venta,
      ...ventasActuales,
    ])

    return {
      ok: true,
      venta,
    }
  }

 const crearEvento = (nuevoEvento) => {
  const evento = {
    ...nuevoEvento,
    id: Date.now(),
    estado: 'Activo',
  }

  setEventos((eventosActuales) => [
    evento,
    ...eventosActuales,
  ])

  setEventoActualId(evento.id)
  localStorage.setItem('eventoActualId', evento.id)
}

 const seleccionarEvento = (eventoId) => {
  setEventoActualId(eventoId)
  localStorage.setItem('eventoActualId', eventoId)
}
  

  const cerrarEvento = (eventoId) => {
    setEventos((eventosActuales) =>
      eventosActuales.map((evento) =>
        evento.id === eventoId
          ? {
              ...evento,
              estado: 'Finalizado',
            }
          : evento
      )
    )
  }

  const eventoActual =
    eventos.find(
      (evento) => evento.id === eventoActualId
    ) || null

  return (
    <StockContext.Provider
      value={{
        productos,
        movimientos,
        ventas,
        eventos,
        eventoActual,
        agregarProducto,
        editarProducto,
        registrarMovimiento,
        registrarVenta,
        crearEvento,
        seleccionarEvento,
        cerrarEvento,
      }}
    >
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  return useContext(StockContext)
}