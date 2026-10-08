import { useEffect, useState } from 'react'

import { obtenerInventarioEvento } from '../services/inventarioService'

import {
  registrarVentaSupabase,
} from '../services/ventasService'

function Ventas() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])

  const [busqueda, setBusqueda] = useState('')

  const [metodoPago, setMetodoPago] =
    useState('Efectivo')

  const [cargando, setCargando] =
    useState(true)

  const [procesandoVenta, setProcesandoVenta] =
    useState(false)

  // =========================
  // CARGAR PRODUCTOS
  // =========================

  const cargarProductos = async () => {
    try {
      setCargando(true)

      const eventoGuardado =
        localStorage.getItem('eventoActualId')

      if (!eventoGuardado) {
        setProductos([])
        return
      }

      const data =
        await obtenerInventarioEvento(
          Number(eventoGuardado)
        )

      setProductos(data)
    } catch (error) {
      console.error(
        'Error cargando productos:',
        error
      )

      alert(
        'No se pudieron cargar los productos.'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  // =========================
  // PRODUCTOS DISPONIBLES
  // =========================

  const productosDisponibles =
    productos.filter(
      (producto) =>
        producto.stock > 0 &&
        producto.nombre
          .toLowerCase()
          .includes(busqueda.toLowerCase())
    )

  // =========================
  // AGREGAR AL CARRITO
  // =========================

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(
      (item) =>
        item.productoId === producto.id
    )

    if (itemExistente) {
      if (
        itemExistente.cantidad >=
        producto.stock
      ) {
        alert(
          'No hay más stock disponible.'
        )

        return
      }

      setCarrito(
        carrito.map((item) =>
          item.productoId === producto.id
            ? {
                ...item,
                cantidad:
                  item.cantidad + 1,
              }
            : item
        )
      )

      return
    }

    setCarrito([
      ...carrito,
      {
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
      },
    ])
  }

  // =========================
  // AUMENTAR CANTIDAD
  // =========================

  const aumentarCantidad = (item) => {
    const producto = productos.find(
      (producto) =>
        producto.id === item.productoId
    )

    if (!producto) {
      return
    }

    if (
      item.cantidad >= producto.stock
    ) {
      alert(
        'No hay más stock disponible.'
      )

      return
    }

    setCarrito(
      carrito.map((productoCarrito) =>
        productoCarrito.productoId ===
        item.productoId
          ? {
              ...productoCarrito,
              cantidad:
                productoCarrito.cantidad + 1,
            }
          : productoCarrito
      )
    )
  }

  // =========================
  // DISMINUIR
  // =========================

  const disminuirCantidad = (item) => {
    if (item.cantidad === 1) {
      setCarrito(
        carrito.filter(
          (productoCarrito) =>
            productoCarrito.productoId !==
            item.productoId
        )
      )

      return
    }

    setCarrito(
      carrito.map((productoCarrito) =>
        productoCarrito.productoId ===
        item.productoId
          ? {
              ...productoCarrito,
              cantidad:
                productoCarrito.cantidad - 1,
            }
          : productoCarrito
      )
    )
  }

  // =========================
  // ELIMINAR
  // =========================

  const eliminarDelCarrito = (
    productoId
  ) => {
    setCarrito(
      carrito.filter(
        (item) =>
          item.productoId !== productoId
      )
    )
  }

  // =========================
  // TOTAL VISUAL
  // =========================

  const total = carrito.reduce(
    (acumulador, item) =>
      acumulador +
      item.precio * item.cantidad,
    0
  )

  // =========================
  // CONFIRMAR VENTA
  // =========================

  const confirmarVenta = async () => {
    if (carrito.length === 0) {
      alert(
        'Agregá al menos un producto.'
      )

      return
    }

    const eventoGuardado =
      localStorage.getItem(
        'eventoActualId'
      )

    if (!eventoGuardado) {
      alert(
        'No hay un evento seleccionado.'
      )

      return
    }

    try {
      setProcesandoVenta(true)

      const resultado =
        await registrarVentaSupabase({
          eventoId:
            Number(eventoGuardado),

          items: carrito,

          metodoPago,
        })

      alert(
        `Venta registrada correctamente.\nTotal: $${formatearPrecio(
          resultado.total
        )}`
      )

      setCarrito([])
      setMetodoPago('Efectivo')

      await cargarProductos()

    } catch (error) {
      console.error(
        'ERROR AL REGISTRAR VENTA:',
        error
      )

      alert(
        error.message ||
        'No se pudo registrar la venta.'
      )
    } finally {
      setProcesandoVenta(false)
    }
  }

  // =========================
  // FORMATEAR PRECIO
  // =========================

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString(
      'es-AR'
    )
  }

  if (cargando) {
    return (
      <div className="sales-page">
        <h1>Ventas</h1>

        <p>
          Cargando productos...
        </p>
      </div>
    )
  }

  return (
    <div className="sales-page">

      <div className="page-header">

        <div>

          <h1>Ventas</h1>

          <p>
            Registrá las ventas de bebidas
            del evento.
          </p>

        </div>

      </div>

      <div className="sales-layout">

        {/* PRODUCTOS */}

        <section className="sales-products">

          <div className="sales-products-header">

            <h2>Productos</h2>

            <input
              className="search-input"
              type="text"
              placeholder="Buscar bebida..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
            />

          </div>

          <div className="sales-products-grid">

            {productosDisponibles.map(
              (producto) => (

                <button
                  key={producto.id}
                  className="sale-product-card"
                  onClick={() =>
                    agregarAlCarrito(
                      producto
                    )
                  }
                >

                  <div className="sale-product-top">

                    <span>
                      {producto.categoria}
                    </span>

                    <small>
                      Stock: {producto.stock}
                    </small>

                  </div>

                  <strong>
                    {producto.nombre}
                  </strong>

                  <div className="sale-product-price">

                    $
                    {formatearPrecio(
                      producto.precio
                    )}

                  </div>

                </button>

              )
            )}

            {productosDisponibles.length ===
              0 && (

              <div className="empty-sales-products">

                No hay productos
                disponibles.

              </div>

            )}

          </div>

        </section>

        {/* CARRITO */}

        <section className="sale-cart">

          <div className="sale-cart-header">

            <div>

              <h2>Venta actual</h2>

              <p>
                {carrito.length}{' '}
                producto(s)
              </p>

            </div>

          </div>

          <div className="sale-cart-items">

            {carrito.length > 0 ? (

              carrito.map((item) => (

                <div
                  className="sale-cart-item"
                  key={item.productoId}
                >

                  <div className="cart-item-info">

                    <strong>
                      {item.nombre}
                    </strong>

                    <span>
                      $
                      {formatearPrecio(
                        item.precio
                      )}{' '}
                      c/u
                    </span>

                  </div>

                  <div className="cart-quantity">

                    <button
                      onClick={() =>
                        disminuirCantidad(
                          item
                        )
                      }
                    >
                      -
                    </button>

                    <strong>
                      {item.cantidad}
                    </strong>

                    <button
                      onClick={() =>
                        aumentarCantidad(
                          item
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                  <div className="cart-item-subtotal">

                    $
                    {formatearPrecio(
                      item.precio *
                      item.cantidad
                    )}

                  </div>

                  <button
                    className="cart-remove"
                    onClick={() =>
                      eliminarDelCarrito(
                        item.productoId
                      )
                    }
                  >
                    ✕
                  </button>

                </div>

              ))

            ) : (

              <div className="empty-cart">

                Todavía no agregaste
                productos.

              </div>

            )}

          </div>

          {/* MÉTODO DE PAGO */}

          <div className="payment-method">

            <label>
              Método de pago
            </label>

            <div className="payment-options">

              {[
                'Efectivo',
                'Transferencia',
                'Mercado Pago',
                'Otro',
                'Regalo',
              ].map((metodo) => (

                <button
                  key={metodo}
                  className={
                    metodoPago === metodo
                      ? 'payment-button active'
                      : 'payment-button'
                  }
                  onClick={() =>
                    setMetodoPago(metodo)
                  }
                >
                  {metodo}
                </button>

              ))}

            </div>

          </div>

          {/* TOTAL */}

          <div className="sale-total">

            <span>Total</span>

            <strong>
              ${formatearPrecio(total)}
            </strong>

          </div>

          <button
            className="charge-button"
            onClick={confirmarVenta}
            disabled={
              carrito.length === 0 ||
              procesandoVenta
            }
          >

            {procesandoVenta
              ? 'Procesando...'
              : `Cobrar $${formatearPrecio(
                  total
                )}`}

          </button>

        </section>

      </div>

    </div>
  )
}

export default Ventas