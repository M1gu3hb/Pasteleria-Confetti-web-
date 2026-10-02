import { fechaConfetti } from '@/utils/calendarioConfetti';
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsappLogo, CaretDown } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { entities } from "@/api/entitiesAdapter";
import SucursalSelector from "./components/SucursalSelector";
import ProductoSearch from "./components/ProductoSearch";
import ProductosVerTodos from "./components/ProductosVerTodos";
import { enviarPedidoWeb, hayEnvioPendiente, urlGraciasPedido } from '@/utils/envioPedidoWeb';

const inputClass =
  "w-full px-4 py-3 text-base font-['Plus_Jakarta_Sans'] text-[#2C1A0E] bg-white border-2 border-[#F0DDD5] rounded-xl focus:outline-none focus:border-[#E8579A] focus:ring-2 focus:ring-[#E8579A]/20 placeholder:text-[#C4A89A] transition-colors duration-200";

const labelClass = "block mb-1.5 text-sm font-['Plus_Jakarta_Sans'] font-medium text-[#2C1A0E]";

function SectionTitle({ children }) {
  return (
    <h2 className="font-['Playfair_Display'] font-semibold text-xl text-[#2C1A0E] border-b border-[#F0DDD5] pb-3 mb-5">
      {children}
    </h2>
  );
}

export default function ConfettiFormularioProductos() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const productoInicialId = urlParams.get("producto");

  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [fechaRecogida, setFechaRecogida] = useState("");
  const [horaRecogida, setHoraRecogida] = useState("");
  const [cantidades, setCantidades] = useState({});
  const [verTodosAbierto, setVerTodosAbierto] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [notaAdicional, setNotaAdicional] = useState("");
  const [enviando, setEnviando] = useState(false);
  const enviandoRef = useRef(false);
  const recuperarEnvio = async () => {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true); setError(null);
    try { navigate(urlGraciasPedido(await enviarPedidoWeb('productos_catalogo'))); }
    catch (e) { setError(e?.message || 'No se pudo recuperar el envío. Intenta de nuevo.'); }
    finally { enviandoRef.current = false; setEnviando(false); }
  };
  const [error, setError] = useState(null);
  const [sinSucursalError, setSinSucursalError] = useState(false);

  const { data: productos = [] } = useQuery({
    queryKey: ["productosWeb"],
    queryFn: () =>
      entities.ProductoTerminado.filter(
        { visible_en_web: true, activo: true },
        "categoria_nombre",
        100
      ),
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursalesActivas"],
    queryFn: () =>
      entities.Sucursal.filter({ activa: true }, "orden_visual"),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categoriasProducto"],
    queryFn: () => entities.CategoriaProducto.list("orden"),
  });

  // Preseleccionar producto si viene del catálogo
  useEffect(() => {
    if (productoInicialId && productos.length > 0 && !cantidades[productoInicialId]) {
      const existe = productos.find((p) => p.id === productoInicialId);
      if (existe) setCantidades((prev) => ({ ...prev, [productoInicialId]: 1 }));
    }
     
  }, [productoInicialId, productos]);

  const incrementar = (id) =>
    setCantidades((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const decrementar = (id) =>
    setCantidades((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  const agregar = (id) =>
    setCantidades((prev) => ({ ...prev, [id]: prev[id] || 1 }));
  const eliminar = (id) =>
    setCantidades((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const seleccionados = productos.filter((p) => (cantidades[p.id] || 0) > 0);
  const totalProductos = seleccionados.reduce((s, p) => s + cantidades[p.id], 0);

  // Sucursales válidas (IDs) de un producto (vacío/null = todas / global).
  // El esquema compartido expone `sucursal_ids` (uuid[]) en catalogo_publico;
  // la disponibilidad se matchea por ID, NO por nombre.
  const sucursalesValidasDe = (p) =>
    Array.isArray(p.sucursal_ids) && p.sucursal_ids.length > 0
      ? p.sucursal_ids
      : null; // null = global

  // IDs permitidos = intersección de los productos seleccionados.
  // null = sin restricción (todos globales).
  const idsPermitidos = useMemo(() => {
    const todos = sucursales.map((s) => s.id);
    let permitidos = null;
    seleccionados.forEach((p) => {
      const validas = sucursalesValidasDe(p);
      if (!validas) return; // global no restringe
      permitidos =
        permitidos === null
          ? validas.filter((id) => todos.includes(id))
          : permitidos.filter((id) => validas.includes(id));
    });
    return permitidos; // null o array de IDs
  }, [seleccionados, sucursales]);

  const hayConflicto = idsPermitidos !== null && idsPermitidos.length === 0;

  // Productos exclusivos (no globales) para el mensaje de conflicto
  const productosExclusivos = seleccionados.filter((p) => sucursalesValidasDe(p));

  // ID -> nombre de sucursal (solo para mostrar en los mensajes).
  const nombreDeSucursal = (id) => sucursales.find((s) => s.id === id)?.nombre || id;

  // Auto-seleccionar cuando queda exactamente una sucursal permitida.
  // Limpiar selección si la seleccionada ya no es permitida.
  useEffect(() => {
    if (hayConflicto) return;
    if (idsPermitidos && idsPermitidos.length === 1) {
      const unica = sucursales.find((s) => s.id === idsPermitidos[0]);
      if (unica && unica.id !== sucursalSeleccionada?.id) setSucursalSeleccionada(unica);
    } else if (
      idsPermitidos &&
      sucursalSeleccionada &&
      !idsPermitidos.includes(sucursalSeleccionada.id)
    ) {
      setSucursalSeleccionada(null);
    }
     
  }, [idsPermitidos, hayConflicto, sucursales]);
  const totalAprox = seleccionados.reduce(
    (s, p) => s + cantidades[p.id] * (p.precio_venta || 0),
    0
  );

  const hoy = fechaConfetti();

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail);

  const puedeEnviar =
    clienteNombre &&
    clienteTelefono &&
    emailValido &&
    fechaRecogida &&
    totalProductos > 0 &&
    sucursalSeleccionada &&
    !hayConflicto;

  const formatearProductosComoTexto = () => {
    const lineas = seleccionados.map(
      (p) =>
        `- ${cantidades[p.id]}x ${p.nombre} ($${(cantidades[p.id] * (p.precio_venta || 0)).toLocaleString("es-MX")})`
    );
    return `PRODUCTOS SOLICITADOS:\n${lineas.join("\n")}\nTotal aprox: $${totalAprox.toLocaleString("es-MX")}`;
  };

  const handleEnviar = async () => {
    if (enviandoRef.current) return;
    if (hayEnvioPendiente('productos_catalogo')) return recuperarEnvio();
    if (!puedeEnviar) {
      setSinSucursalError(!sucursalSeleccionada);
      setError(
        totalProductos === 0
          ? "Selecciona al menos un producto"
          : "Por favor completa todos los campos requeridos"
      );
      return;
    }

    enviandoRef.current = true;
    setEnviando(true);
    setError(null);
    setSinSucursalError(false);

    try {
      const resultado = await entities.PedidoPastel.create({
        sucursal_id: sucursalSeleccionada.id,
        sucursal_nombre: sucursalSeleccionada.nombre,
        origen: "web",
        estado: "pendiente",
        tipo_pedido: "productos_catalogo",
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        cliente_email: clienteEmail || null,
        fecha_entrega: fechaRecogida,
        hora_entrega: horaRecogida || null,
        kilos: 0,
        notas_generales:
          formatearProductosComoTexto() +
          (notaAdicional ? `\n\nNOTA: ${notaAdicional}` : ""),
        total_final: totalAprox,
        devolver_base: true,
        creado_por_nombre: "Web Confetti",
        a_cuenta: 0,
        total_abonado: 0,
        saldo_pendiente: totalAprox,
      }, { whatsapp: sucursalSeleccionada.whatsapp_numero || sucursalSeleccionada.telefono || '' });

      navigate(urlGraciasPedido(resultado));
    } catch (err) {
      console.error("Error al crear pedido de productos:", err);
      setError(
        err?.message || "No se confirmó el envío. Recupera el mismo pedido o contáctanos por WhatsApp."
      );
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pb-32">
      {hayEnvioPendiente('productos_catalogo') && <div role="alert" className="my-4 p-4 border rounded-xl bg-amber-50">
        <p>Hay un envío pendiente de confirmar. Recupera su folio antes de enviar otro pedido.</p>
        <button type="button" className="mt-2 font-semibold underline" disabled={enviando} onClick={recuperarEnvio}>Recuperar pedido enviado</button>
      </div>}
      {/* Header */}
      <div className="text-center">
        <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-[#2C1A0E]">
          Pedir productos y rebanadas
        </h1>
        <p className="mt-3 font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
          Selecciona lo que quieres y dinos cuándo pasas a recoger.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {/* Sección 1 — Tus datos */}
        <section>
          <SectionTitle>① Tus datos</SectionTitle>
          <div className="space-y-4">
            <div>
              <label htmlFor="confetti-productos-1" className={labelClass}>Nombre completo *</label>
              <input id="confetti-productos-1"
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confetti-productos-telefono" className={labelClass}>Teléfono / WhatsApp *</label>
              <div className="relative">
                <WhatsappLogo
                  size={20}
                  weight="fill"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E8579A]"
                />
                <input id="confetti-productos-telefono"
                  type="tel"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="10 dígitos"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="confetti-productos-2" className={labelClass}>Correo electrónico *</label>
              <input id="confetti-productos-2"
                type="email"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                placeholder="Para contactarte sobre tu pedido"
                className={inputClass}
              />
              {clienteEmail && !emailValido && (
                <p className="mt-1.5 text-xs font-['Plus_Jakarta_Sans'] text-red-500">
                  Ingresa un correo válido
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sección 2 — Cuándo recoges */}
        <section>
          <SectionTitle>② ¿Cuándo recoges?</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="confetti-productos-3" className={labelClass}>Fecha de recogida *</label>
              <input id="confetti-productos-3"
                type="date"
                min={hoy}
                value={fechaRecogida}
                onChange={(e) => setFechaRecogida(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="confetti-productos-4" className={labelClass}>Hora aproximada</label>
              <input id="confetti-productos-4"
                type="time"
                value={horaRecogida}
                onChange={(e) => setHoraRecogida(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Sección 3 — Productos */}
        <section>
          <SectionTitle>③ ¿Qué quieres pedir?</SectionTitle>

          {/* Buscador siempre visible */}
          <ProductoSearch
            productos={productos}
            cantidades={cantidades}
            onIncrementar={incrementar}
            onDecrementar={decrementar}
            onAgregar={agregar}
            onEliminar={eliminar}
            totalAprox={totalAprox}
          />

          {/* Botón expandir/contraer "Ver todos" */}
          <button
            type="button"
            onClick={() => setVerTodosAbierto((v) => !v)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#F0DDD5] bg-white text-[#5C2D1E] font-['Plus_Jakarta_Sans'] font-semibold text-sm hover:border-[#E8579A] hover:bg-[#FEF0E7] transition-colors"
          >
            {verTodosAbierto ? "Ocultar productos" : "Ver todos los productos"}
            <CaretDown
              size={16}
              weight="bold"
              className={`transition-transform ${verTodosAbierto ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {verTodosAbierto && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <ProductosVerTodos
                    productos={productos}
                    cantidades={cantidades}
                    onIncrementar={incrementar}
                    onDecrementar={decrementar}
                    totalAprox={totalAprox}
                    categorias={categorias}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Sección 4 — Sucursal */}
        <section>
          <SectionTitle>④ Sucursal de recogida</SectionTitle>
          <p className="mb-4 text-sm font-['Plus_Jakarta_Sans'] font-medium text-red-500">
            * Campo requerido — no podemos procesar el pedido sin sucursal
          </p>

          {hayConflicto ? (
            <div className="mb-4 bg-[#FFF8F4] border-2 border-[#F0DDD5] text-[#5C2D1E] text-sm font-['Plus_Jakarta_Sans'] p-4 rounded-2xl">
              <p className="mb-2">
                🛈 Estás mezclando productos de distintas sucursales. Cada pedido se recoge o
                se entrega desde una sola sucursal.
              </p>
              <p className="mb-3">
                Te sugerimos enviar este pedido con los productos de una sucursal, y hacer un
                segundo pedido para los demás. 😊
              </p>
              <p className="font-semibold mb-1">Productos por sucursal:</p>
              <ul className="space-y-0.5">
                {productosExclusivos.map((p) => (
                  <li key={p.id}>
                    • <strong>{p.nombre}</strong> → {(p.sucursal_ids || []).map(nombreDeSucursal).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            idsPermitidos &&
            idsPermitidos.length === 1 && (
              <div className="mb-4 bg-[#FDEEF6] text-[#5C2D1E] text-sm font-['Plus_Jakarta_Sans'] p-4 rounded-2xl">
                🛈 {productosExclusivos.map((p) => `"${p.nombre}"`).join(", ")} solo está
                disponible en <strong>{nombreDeSucursal(idsPermitidos[0])}</strong>. Tu pedido se recogerá
                en esa sucursal.
              </div>
            )
          )}

          <SucursalSelector
            sucursales={sucursales}
            seleccionada={sucursalSeleccionada}
            idsPermitidos={hayConflicto ? [] : idsPermitidos}
            onSelect={(s) => {
              setSucursalSeleccionada(s);
              setSinSucursalError(false);
            }}
            error={sinSucursalError}
          />
        </section>

        {/* Sección 5 — Nota */}
        <section>
          <SectionTitle>⑤ Nota opcional</SectionTitle>
          <textarea aria-label="Observaciones adicionales"
            rows={3}
            value={notaAdicional}
            onChange={(e) => setNotaAdicional(e.target.value)}
            placeholder="Cualquier indicación adicional..."
            className={inputClass}
          />
        </section>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-['Plus_Jakarta_Sans'] p-3 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Resumen sticky inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#F0DDD5] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="font-['Plus_Jakarta_Sans'] text-sm text-[#2C1A0E]">
            <span className="font-semibold">{totalProductos}</span> producto
            {totalProductos !== 1 ? "s" : ""} · Total aprox:{" "}
            <span className="font-['Playfair_Display'] font-semibold text-[#5C2D1E]">
              ${totalAprox.toLocaleString("es-MX")}
            </span>
          </div>
          <motion.button
            type="button"
            disabled={!puedeEnviar || enviando}
            onClick={handleEnviar}
            whileTap={puedeEnviar && !enviando ? { scale: 0.97 } : {}}
            className={`shrink-0 inline-flex items-center gap-2 px-6 py-3 font-['Plus_Jakarta_Sans'] font-semibold text-sm rounded-2xl transition-colors ${
              puedeEnviar && !enviando
                ? "bg-[#E8579A] text-white hover:bg-[#d44488]"
                : "bg-[#F0DDD5] text-[#C4A89A] cursor-not-allowed"
            }`}
          >
            {enviando ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </span>
            ) : (
              "Pedir"
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
