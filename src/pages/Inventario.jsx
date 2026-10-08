import { useEffect, useState } from 'react'
import { useStock } from '../context/StockContext'

import {
  obtenerInventarioEvento,
  registrarMovimientoSupabase,
  obtenerMovimientosProducto,
  crearProductoSupabase,
  editarProductoSupabase,
} from '../services/inventarioService'

function Inventario() {
  const [historialProducto, setHistorialProducto] = useState([])



  // =========================
  // DATOS DESDE SUPABASE
  // =========================

  const [productos, setProductos] = useState([])
  const [cargandoInventario, setCargandoInventario] = useState(true)

  // =========================
  // FILTROS
  // =========================

  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState('Todas')

  // =========================
  // MODALES
  // =========================

  const [mostrarModalProducto, setMostrarModalProducto] =
    useState(false)

  const [mostrarModalMovimiento, setMostrarModalMovimiento] =
    useState(false)

  const [mostrarModalEditar, setMostrarModalEditar] =
    useState(false)

  const [mostrarHistorial, setMostrarHistorial] =
    useState(false)

  // =========================
  // PRODUCTOS SELECCIONADOS
  // =========================

  const [productoSeleccionado, setProductoSeleccionado] =
    useState(null)

  const [productoEditando, setProductoEditando] =
    useState(null)

  const [tipoOperacion, setTipoOperacion] =
    useState('entrada')

  // =========================
  // FORMULARIO NUEVO PRODUCTO
  // =========================

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: 'Cervezas',
    stock: '',
    costo: '',
    precio: '',
    stockMinimo: '',
  })

  // =========================
  // FORMULARIO MOVIMIENTO
  // =========================

  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    cantidad: '',
    motivo: '',
    observacion: '',
  })

  // =========================
  // CATEGORÍAS
  // =========================

  const categorias = [
    'Todas',
    'Cervezas',
    'Fernet',
    'Vodka',
    'Gin',
    'Gaseosas',
    'Energizantes',
    'Agua',
    'Hielo',
    'Otros',
  ]

  const categoriasFormulario = categorias.filter(
    (categoria) => categoria !== 'Todas'
  )

  const motivosEntrada = [
    'Compra',
    'Reposición',
    'Devolución',
    'Ajuste',
  ]

  const motivosSalida = [
    'Venta',
    'Consumo',
    'Rotura',
    'Regalo',
    'Pérdida',
    'Ajuste',
  ]

  // =========================
  // CARGAR INVENTARIO SUPABASE
  // =========================

  const cargarInventario = async () => {
    try {
      setCargandoInventario(true)

      const eventoGuardado =
        localStorage.getItem('eventoActualId')

      if (!eventoGuardado) {
        setProductos([])
        return
      }

      const data = await obtenerInventarioEvento(
        Number(eventoGuardado)
      )

      setProductos(data)
    } catch (error) {
      console.error(
        'Error al cargar inventario:',
        error
      )

      alert('No se pudo cargar el inventario.')
    } finally {
      setCargandoInventario(false)
    }
  }

  useEffect(() => {
    cargarInventario()
  }, [])

  // =========================
  // FORMATO DE PRECIO
  // =========================

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-AR')
  }

  // =========================
  // ESTADO DE STOCK
  // =========================

  const obtenerEstado = (producto) => {
    if (producto.stock === 0) {
      return {
        texto: 'Sin stock',
        clase: 'stock-status stock-empty',
      }
    }

    if (producto.stock <= producto.stockMinimo) {
      return {
        texto: 'Stock bajo',
        clase: 'stock-status stock-low',
      }
    }

    return {
      texto: 'Disponible',
      clase: 'stock-status stock-ok',
    }
  }

  // =========================
  // FILTRADO
  // =========================

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase())

    const coincideCategoria =
      categoriaSeleccionada === 'Todas' ||
      producto.categoria === categoriaSeleccionada

    return coincideBusqueda && coincideCategoria
  })

  // =========================
  // NUEVO PRODUCTO
  // =========================

  const manejarCambioProducto = (e) => {
    const { name, value } = e.target

    setNuevoProducto({
      ...nuevoProducto,
      [name]: value,
    })
  }

  const guardarProducto = async (e) => {
  e.preventDefault()

  if (
    !nuevoProducto.nombre.trim() ||
    nuevoProducto.stock === '' ||
    nuevoProducto.costo === '' ||
    nuevoProducto.precio === '' ||
    nuevoProducto.stockMinimo === ''
  ) {
    alert('Completá todos los campos.')
    return
  }

  const eventoGuardado =
    localStorage.getItem('eventoActualId')

  if (!eventoGuardado) {
    alert('No hay un evento seleccionado.')
    return
  }

  try {
    await crearProductoSupabase({
      eventoId: Number(eventoGuardado),
      nombre: nuevoProducto.nombre.trim(),
      categoria: nuevoProducto.categoria,
      stock: Number(nuevoProducto.stock),
      costo: Number(nuevoProducto.costo),
      precio: Number(nuevoProducto.precio),
      stockMinimo: Number(
        nuevoProducto.stockMinimo
      ),
    })

    await cargarInventario()

    setNuevoProducto({
      nombre: '',
      categoria: 'Cervezas',
      stock: '',
      costo: '',
      precio: '',
      stockMinimo: '',
    })

    setMostrarModalProducto(false)
  } catch (error) {
    console.error(
      'Error al crear producto:',
      error
    )

    alert(
      error.message ||
      'No se pudo crear el producto.'
    )
  }
}

  // =========================
  // MOVIMIENTOS
  // =========================

  const abrirMovimiento = (producto, operacion) => {
    setProductoSeleccionado(producto)
    setTipoOperacion(operacion)

    setNuevoMovimiento({
      cantidad: '',
      motivo:
        operacion === 'entrada'
          ? 'Compra'
          : 'Venta',
      observacion: '',
    })

    setMostrarModalMovimiento(true)
  }

  const guardarMovimiento = async (e) => {
  e.preventDefault()

  const cantidad = Number(nuevoMovimiento.cantidad)

  if (!cantidad || cantidad <= 0) {
    alert('Ingresá una cantidad válida.')
    return
  }

  if (
    tipoOperacion === 'salida' &&
    cantidad > productoSeleccionado.stock
  ) {
    alert('No hay suficiente stock disponible.')
    return
  }

  const eventoGuardado =
    localStorage.getItem('eventoActualId')

  if (!eventoGuardado) {
    alert('No hay un evento seleccionado.')
    return
  }

  try {
    const resultado =
      await registrarMovimientoSupabase({
        eventoId: Number(eventoGuardado),
        productoId: productoSeleccionado.id,
        tipo: tipoOperacion,
        motivo: nuevoMovimiento.motivo,
        cantidad,
        observacion: nuevoMovimiento.observacion,
      })

    console.log(
      'MOVIMIENTO SUPABASE:',
      resultado
    )

    await cargarInventario()

    setMostrarModalMovimiento(false)
    setProductoSeleccionado(null)

    setNuevoMovimiento({
      cantidad: '',
      motivo: '',
      observacion: '',
    })
  } catch (error) {
    console.error(
      'ERROR MOVIMIENTO SUPABASE:',
      error
    )

    alert(
      error.message ||
      'No se pudo registrar el movimiento.'
    )
  }
}

  // =========================
  // EDITAR PRODUCTO
  // =========================

  const abrirEditarProducto = (producto) => {
    setProductoEditando({
      ...producto,
    })

    setMostrarModalEditar(true)
  }

  const guardarEdicion = async (e) => {
  e.preventDefault()

  if (
    !productoEditando.nombre.trim() ||
    productoEditando.costo === '' ||
    productoEditando.precio === '' ||
    productoEditando.stockMinimo === ''
  ) {
    alert('Completá todos los campos.')
    return
  }

  try {
    await editarProductoSupabase({
      id: productoEditando.id,
      nombre: productoEditando.nombre.trim(),
      categoria: productoEditando.categoria,
      costo: Number(productoEditando.costo),
      precio: Number(productoEditando.precio),
      stockMinimo: Number(
        productoEditando.stockMinimo
      ),
    })

    await cargarInventario()

    setMostrarModalEditar(false)
    setProductoEditando(null)
  } catch (error) {
    console.error(
      'Error al editar producto:',
      error
    )

    alert(
      error.message ||
      'No se pudo editar el producto.'
    )
  }
}

  // =========================
  // LOADING
  // =========================

  if (cargandoInventario) {
    return (
      <div className="inventory-page">
        <h1>Inventario</h1>
        <p>Cargando inventario...</p>
      </div>
    )
  }

  // =========================
  // INTERFAZ
  // =========================

  return (
    <div className="inventory-page">

      <div className="page-header">

        <div>
          <h1>Inventario</h1>

          <p>
            Control de bebidas y stock del evento.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setMostrarModalProducto(true)
          }
        >
          + Agregar producto
        </button>

      </div>

      <div className="inventory-tools">

        <input
          className="search-input"
          type="text"
          placeholder="Buscar bebida..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        <div className="category-filters">

          {categorias.map((categoria) => (
            <button
              key={categoria}
              className={
                categoriaSeleccionada === categoria
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() =>
                setCategoriaSeleccionada(categoria)
              }
            >
              {categoria}
            </button>
          ))}

        </div>

      </div>

      <div className="inventory-card">

        <div className="inventory-table-wrapper">

          <table className="inventory-table">

            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Costo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {productosFiltrados.length > 0 ? (

                productosFiltrados.map((producto) => {
                  const estado =
                    obtenerEstado(producto)

                  return (
                    <tr key={producto.id}>

                      <td>
                        <strong>
                          {producto.nombre}
                        </strong>
                      </td>

                      <td>
                        {producto.categoria}
                      </td>

                      <td>
                        <strong>
                          {producto.stock}
                        </strong>
                      </td>

                      <td>
                        $
                        {formatearPrecio(
                          producto.costo
                        )}
                      </td>

                      <td>
                        $
                        {formatearPrecio(
                          producto.precio
                        )}
                      </td>

                      <td>
                        <span
                          className={estado.clase}
                        >
                          {estado.texto}
                        </span>
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            className="action-button add"
                            title="Agregar stock"
                            onClick={() =>
                              abrirMovimiento(
                                producto,
                                'entrada'
                              )
                            }
                          >
                            +
                          </button>

                          <button
                            className="action-button remove"
                            title="Quitar stock"
                            onClick={() =>
                              abrirMovimiento(
                                producto,
                                'salida'
                              )
                            }
                          >
                            -
                          </button>

                          <button
                            className="action-button edit"
                            title="Editar producto"
                            onClick={() =>
                              abrirEditarProducto(
                                producto
                              )
                            }
                          >
                            ✏️
                          </button>

                          <button
                            className="action-button history"
                            title="Ver movimientos"
                            onClick={async () => {
  try {
    const eventoGuardado =
      localStorage.getItem('eventoActualId')

    if (!eventoGuardado) {
      alert('No hay un evento seleccionado.')
      return
    }

    const historial =
      await obtenerMovimientosProducto(
        Number(eventoGuardado),
        producto.id
      )

    setHistorialProducto(historial)
    setProductoSeleccionado(producto)
    setMostrarHistorial(true)
  } catch (error) {
    console.error(
      'Error al cargar historial:',
      error
    )

    alert(
      'No se pudo cargar el historial.'
    )
  }
}}
                          >
                            📦
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                })

              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="empty-table-message"
                  >
                    No se encontraron productos.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================
          MODAL AGREGAR PRODUCTO
      ========================= */}

      {mostrarModalProducto && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>Agregar producto</h2>

                <p>
                  Cargá una nueva bebida al inventario.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setMostrarModalProducto(false)
                }
              >
                ✕
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={guardarProducto}
            >

              <div className="form-group">

                <label>
                  Nombre del producto
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={manejarCambioProducto}
                  placeholder="Ej: Cerveza Andes 473ml"
                />

              </div>

              <div className="form-group">

                <label>Categoría</label>

                <select
                  name="categoria"
                  value={nuevoProducto.categoria}
                  onChange={manejarCambioProducto}
                >

                  {categoriasFormulario.map(
                    (categoria) => (
                      <option
                        key={categoria}
                        value={categoria}
                      >
                        {categoria}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>Stock inicial</label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={nuevoProducto.stock}
                    onChange={manejarCambioProducto}
                  />

                </div>

                <div className="form-group">

                  <label>Stock mínimo</label>

                  <input
                    type="number"
                    name="stockMinimo"
                    min="0"
                    value={nuevoProducto.stockMinimo}
                    onChange={manejarCambioProducto}
                  />

                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>Costo</label>

                  <input
                    type="number"
                    name="costo"
                    min="0"
                    value={nuevoProducto.costo}
                    onChange={manejarCambioProducto}
                  />

                </div>

                <div className="form-group">

                  <label>Precio de venta</label>

                  <input
                    type="number"
                    name="precio"
                    min="0"
                    value={nuevoProducto.precio}
                    onChange={manejarCambioProducto}
                  />

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setMostrarModalProducto(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Guardar producto
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          MODAL MOVIMIENTO
      ========================= */}

      {mostrarModalMovimiento &&
        productoSeleccionado && (

        <div className="modal-overlay">

          <div className="modal-card movement-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {tipoOperacion === 'entrada'
                    ? 'Agregar stock'
                    : 'Quitar stock'}
                </h2>

                <p>
                  {productoSeleccionado.nombre}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setMostrarModalMovimiento(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="current-stock-box">

              <span>Stock actual</span>

              <strong>
                {productoSeleccionado.stock}
              </strong>

              <span>unidades</span>

            </div>

            <form
              className="product-form"
              onSubmit={guardarMovimiento}
            >

              <div className="form-group">

                <label>Cantidad</label>

                <input
                  type="number"
                  min="1"
                  value={nuevoMovimiento.cantidad}
                  onChange={(e) =>
                    setNuevoMovimiento({
                      ...nuevoMovimiento,
                      cantidad: e.target.value,
                    })
                  }
                  placeholder="Ej: 5"
                  autoFocus
                />

              </div>

              <div className="form-group">

                <label>
                  Motivo del movimiento
                </label>

                <select
                  value={nuevoMovimiento.motivo}
                  onChange={(e) =>
                    setNuevoMovimiento({
                      ...nuevoMovimiento,
                      motivo: e.target.value,
                    })
                  }
                >

                  {(tipoOperacion === 'entrada'
                    ? motivosEntrada
                    : motivosSalida
                  ).map((motivo) => (

                    <option
                      key={motivo}
                      value={motivo}
                    >
                      {motivo}
                    </option>

                  ))}

                </select>

              </div>

              <div className="form-group">

                <label>
                  Observación
                  <span className="optional-text">
                    {' '}(opcional)
                  </span>
                </label>

                <textarea
                  value={nuevoMovimiento.observacion}
                  onChange={(e) =>
                    setNuevoMovimiento({
                      ...nuevoMovimiento,
                      observacion:
                        e.target.value,
                    })
                  }
                  placeholder="Ej: Reposición de depósito..."
                  rows="3"
                />

              </div>

              {nuevoMovimiento.cantidad && (

                <div className="stock-preview">

                  <div>
                    <span>Antes</span>

                    <strong>
                      {productoSeleccionado.stock}
                    </strong>
                  </div>

                  <div className="stock-arrow">
                    →
                  </div>

                  <div>

                    <span>Después</span>

                    <strong>

                      {tipoOperacion === 'entrada'
                        ? productoSeleccionado.stock +
                          Number(
                            nuevoMovimiento.cantidad
                          )
                        : Math.max(
                            0,
                            productoSeleccionado.stock -
                              Number(
                                nuevoMovimiento.cantidad
                              )
                          )}

                    </strong>

                  </div>

                </div>

              )}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setMostrarModalMovimiento(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    tipoOperacion === 'entrada'
                      ? 'primary-button'
                      : 'danger-button'
                  }
                >
                  {tipoOperacion === 'entrada'
                    ? 'Agregar stock'
                    : 'Quitar stock'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          MODAL EDITAR
      ========================= */}

      {mostrarModalEditar &&
        productoEditando && (

        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>
                <h2>Editar producto</h2>

                <p>
                  Modificá la información del producto.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setMostrarModalEditar(false)
                  setProductoEditando(null)
                }}
              >
                ✕
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={guardarEdicion}
            >

              <div className="form-group">

                <label>Nombre</label>

                <input
                  type="text"
                  value={productoEditando.nombre}
                  onChange={(e) =>
                    setProductoEditando({
                      ...productoEditando,
                      nombre: e.target.value,
                    })
                  }
                />

              </div>

              <div className="form-group">

                <label>Categoría</label>

                <select
                  value={productoEditando.categoria}
                  onChange={(e) =>
                    setProductoEditando({
                      ...productoEditando,
                      categoria: e.target.value,
                    })
                  }
                >

                  {categoriasFormulario.map(
                    (categoria) => (
                      <option
                        key={categoria}
                        value={categoria}
                      >
                        {categoria}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>Costo</label>

                  <input
                    type="number"
                    min="0"
                    value={productoEditando.costo}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        costo: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label>Precio de venta</label>

                  <input
                    type="number"
                    min="0"
                    value={productoEditando.precio}
                    onChange={(e) =>
                      setProductoEditando({
                        ...productoEditando,
                        precio: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="form-group">

                <label>Stock mínimo</label>

                <input
                  type="number"
                  min="0"
                  value={
                    productoEditando.stockMinimo
                  }
                  onChange={(e) =>
                    setProductoEditando({
                      ...productoEditando,
                      stockMinimo:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="edit-stock-warning">

                Stock actual:{' '}

                <strong>
                  {productoEditando.stock}
                </strong>

                <br />

                Para modificarlo usá los botones
                + o - del inventario.

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setMostrarModalEditar(false)
                    setProductoEditando(null)
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Guardar cambios
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          HISTORIAL
      ========================= */}

      {mostrarHistorial &&
        productoSeleccionado && (

        <div className="modal-overlay">

          <div className="modal-card history-modal">

            <div className="modal-header">

              <div>
                <h2>
                  Historial del producto
                </h2>

                <p>
                  {productoSeleccionado.nombre}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setMostrarHistorial(false)
                  setProductoSeleccionado(null)
                }}
              >
                ✕
              </button>

            </div>

<div className="product-history-list">

  {historialProducto.length > 0 ? (

    historialProducto.map((movimiento) => {

      const fechaMovimiento =
        new Date(movimiento.created_at)

      return (
        <div
          className="history-item"
          key={movimiento.id}
        >

          <div className="history-main">

            <strong>
              {movimiento.tipo === 'entrada'
                ? '+'
                : '-'}
              {movimiento.cantidad}
            </strong>

            <div>

              <span>
                {movimiento.motivo}
              </span>

              <small>
                {fechaMovimiento.toLocaleDateString(
                  'es-AR'
                )}
                {' · '}
                {fechaMovimiento.toLocaleTimeString(
                  'es-AR',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </small>

            </div>

          </div>

          <div className="history-stock">

            {movimiento.stock_anterior}

            {' → '}

            {movimiento.stock_nuevo}

          </div>

          {movimiento.observacion && (
            <p>
              {movimiento.observacion}
            </p>
          )}

        </div>
      )
    })

  ) : (

    <div className="empty-history">
      Este producto todavía no tiene movimientos.
    </div>

  )}

</div>

          </div>

        </div>

      )}

    </div>
  )
}

export default Inventario