import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  WhatsappLogo,
  Upload,
  X,
  CalendarBlank,
  Warning,
} from "@phosphor-icons/react";
import { ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { entities, uploadArchivo } from "@/api/entitiesAdapter";
import SucursalSelector from "./components/SucursalSelector";
import PrecioResumen from "./components/PrecioResumen";
import RellenoSelector from "./components/RellenoSelector";

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

export default function ConfettiFormularioPastel() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Datos cliente
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [requiereEntrega, setRequiereEntrega] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState("");

  // Fecha y hora
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");

  // Tamaño — arrancan vacíos: el cliente pone PRIMERO las personas y de ahí se
  // sugieren los kilos (kilos en 0 por defecto, no 3).
  const [personas, setPersonas] = useState("");
  const [kilos, setKilos] = useState("");
  const [kilosEditadoManual, setKilosEditadoManual] = useState(false);
  const [precioKilo, setPrecioKilo] = useState(0);
  const [ratio, setRatio] = useState(10);

  // Extras — mapa { [extraId]: boolean }
  const [extrasSeleccionados, setExtrasSeleccionados] = useState({});

  // Concepto
  const [concepto, setConcepto] = useState("");
  const [decorado, setDecorado] = useState("");
  const [rellenos, setRellenos] = useState("");
  const [rellenoPrecio, setRellenoPrecio] = useState(0);
  const [leyenda, setLeyenda] = useState("");

  // Imagen
  const [imagenReferencia, setImagenReferencia] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  // Sucursal y notas
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [notasAdicionales, setNotasAdicionales] = useState("");

  // Estado de envío
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [sinSucursalError, setSinSucursalError] = useState(false);
  const [mostrarResumenMovil, setMostrarResumenMovil] = useState(false);

  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursalesActivas"],
    queryFn: () =>
      entities.Sucursal.filter({ activa: true }, "orden_visual"),
  });

  const { data: configLocal } = useQuery({
    queryKey: ["confConfig"],
    queryFn: async () => {
      const list = await entities.ConfiguracionNegocio.list();
      return list[0] || null;
    },
  });
  useEffect(() => {
    if (configLocal) {
      setPrecioKilo(configLocal.precio_kilo_global || 140);
      setRatio(configLocal.ratio_personas_por_kilo || 7);
    }
  }, [configLocal]);

  // Calcular kilos sugeridos al cambiar personas. Solo autocompleta si el cliente
  // ya escribió las personas (kilos arranca en 0 — primero las personas).
  const kilosSugeridos = Math.max(1, Math.ceil((Number(personas) || 0) / (ratio || 10)));
  useEffect(() => {
    if (!kilosEditadoManual && Number(personas) > 0) setKilos(kilosSugeridos);
  }, [kilosSugeridos, kilosEditadoManual, personas]);

  // Pastel grande (más de 3 kg) → se incluye el "Pastel de base" automáticamente.
  useEffect(() => {
    if (Number(kilos) > 3) {
      setExtrasSeleccionados((prev) => (prev.base ? prev : { ...prev, base: true }));
    }
  }, [kilos]);

  // Fecha mínima: mañana
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minFecha = manana.toISOString().split("T")[0];

  // Advertencia anticipación
  const fechaCercana = (() => {
    if (!fechaEntrega) return false;
    const diff = (new Date(fechaEntrega) - new Date()) / (1000 * 60 * 60 * 24);
    return diff < 3;
  })();

  // Extras sincronizados desde el POS
  const extrasPastel = useMemo(() => {
    const fallback = [
      { id: "base", nombre: "Pastel de base", precio: 0, activo: true },
      { id: "oblea", nombre: "Oblea personalizada", precio: 0, activo: true },
      { id: "muneca", nombre: "Muñeca decorativa", precio: 0, activo: true },
      { id: "velas", nombre: "Velas", precio: 0, activo: true },
    ];
    if (!configLocal?.extras_pastel) return fallback.filter((e) => e.activo);
    try {
      const arr = JSON.parse(configLocal.extras_pastel);
      return Array.isArray(arr) ? arr.filter((e) => e?.activo) : fallback;
    } catch {
      return fallback;
    }
  }, [configLocal?.extras_pastel]);

  // Rellenos sincronizados desde el POS (espejo de extras)
  const rellenosPastel = useMemo(() => {
    if (!configLocal?.rellenos_pastel) return [];
    try {
      const arr = JSON.parse(configLocal.rellenos_pastel);
      return Array.isArray(arr) ? arr.filter((r) => r?.activo) : [];
    } catch {
      return [];
    }
  }, [configLocal?.rellenos_pastel]);

  // Precios — si el relleno define precio, ese manda; si no, usa el global
  const precioKiloEfectivo = rellenoPrecio || precioKilo || 0;
  const subtotalPastel = (kilos || 0) * precioKiloEfectivo;
  const subtotalExtras = useMemo(() => {
    return extrasPastel.reduce((sum, extra) => {
      if (!extrasSeleccionados[extra.id]) return sum;
      return sum + (Number(extra.precio) || 0);
    }, 0);
  }, [extrasPastel, extrasSeleccionados]);
  const totalCalculado = subtotalPastel + subtotalExtras;

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 5MB");
      return;
    }
    setImagenReferencia(file);
    setImagenPreview(URL.createObjectURL(file));
    setError(null);
  };

  const quitarImagen = () => {
    setImagenReferencia(null);
    setImagenPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail);

  const puedeEnviar =
    clienteNombre &&
    clienteTelefono &&
    emailValido &&
    fechaEntrega &&
    Number(kilos) > 0 &&
    sucursalSeleccionada;

  const handleEnviarPedido = async () => {
    if (!puedeEnviar) {
      setSinSucursalError(!sucursalSeleccionada);
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    setEnviando(true);
    setError(null);
    setSinSucursalError(false);

    try {
      let imagenUrl = null;
      if (imagenReferencia) {
        const uploadResult = await uploadArchivo(imagenReferencia);
        imagenUrl = uploadResult?.file_url || null;
      }

      const pedidoData = {
        sucursal_id: sucursalSeleccionada.id,
        sucursal_nombre: sucursalSeleccionada.nombre,
        origen: "web",
        estado: "pendiente",
        tipo_pedido: "pastel_personalizado",
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        cliente_email: clienteEmail || null,
        cliente_direccion: requiereEntrega ? direccionEntrega : null,
        requiere_entrega: requiereEntrega,
        fecha_entrega: fechaEntrega,
        hora_entrega: horaEntrega || null,
        kilos: Number(kilos) || 0,
        personas_estimadas: Number(personas) || 0,
        concepto: concepto || null,
        decorado: decorado || null,
        rellenos: rellenos || null,
        leyenda_pastel: leyenda || null,
        incluye_base: !!extrasSeleccionados.base,
        precio_base: Number(extrasPastel.find((e) => e.id === "base")?.precio) || 0,
        incluye_oblea: !!extrasSeleccionados.oblea,
        precio_oblea: Number(extrasPastel.find((e) => e.id === "oblea")?.precio) || 0,
        incluye_muneca: !!extrasSeleccionados.muneca,
        precio_muneca: Number(extrasPastel.find((e) => e.id === "muneca")?.precio) || 0,
        incluye_velas: !!extrasSeleccionados.velas,
        precio_velas: Number(extrasPastel.find((e) => e.id === "velas")?.precio) || 0,
        precio_kilo_usado: precioKiloEfectivo || 0,
        subtotal_pastel: subtotalPastel,
        subtotal_extras: subtotalExtras,
        total_calculado: totalCalculado,
        total_final: totalCalculado,
        imagen_referencia_url: imagenUrl,
        notas_generales: notasAdicionales || null,
      };

      const resultado = await entities.PedidoPastel.create({
        ...pedidoData,
        devolver_base: true,
        creado_por_nombre: "Web Confetti",
        a_cuenta: 0,
        total_abonado: 0,
        saldo_pendiente: pedidoData.total_final || 0,
      });

      navigate(
        `/confetti/gracias?folio=${encodeURIComponent(resultado.folio)}&sucursal=${encodeURIComponent(sucursalSeleccionada.nombre)}&fecha=${encodeURIComponent(fechaEntrega)}&wa=${encodeURIComponent(sucursalSeleccionada.whatsapp_numero || sucursalSeleccionada.telefono || "")}`
      );
    } catch (err) {
      console.error("Error al crear pedido web:", err);
      setError(
        "Hubo un problema al enviar tu pedido. Por favor intenta de nuevo o contáctanos por WhatsApp."
      );
    } finally {
      setEnviando(false);
    }
  };

  const toggleExtra = (id, checked) =>
    setExtrasSeleccionados((prev) => ({ ...prev, [id]: checked }));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-32 lg:pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-block bg-[#FDEEF6] text-[#E8579A] text-xs font-['Plus_Jakarta_Sans'] font-bold px-4 py-2 rounded-full">
          🎂 Solicitud de Pastel Personalizado
        </span>
        <h1 className="mt-4 font-['Playfair_Display'] text-3xl md:text-4xl font-semibold text-[#2C1A0E]">
          Cuéntanos cómo quieres tu pastel
        </h1>
        <p className="mt-3 font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
          Completa el formulario y te confirmamos por WhatsApp. Sin cobros en línea — solo
          coordinamos contigo.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-10">
          {/* ① Datos de contacto */}
          <section>
            <SectionTitle>① Tus datos de contacto</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nombre completo *</label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="¿Cómo te llamas?"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono / WhatsApp *</label>
                <div className="relative">
                  <WhatsappLogo
                    size={20}
                    weight="fill"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E8579A]"
                  />
                  <input
                    type="tel"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="10 dígitos"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Correo electrónico *</label>
                <input
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
              <label className="flex items-center gap-3 cursor-pointer font-['Plus_Jakarta_Sans'] text-sm text-[#2C1A0E]">
                <input
                  type="checkbox"
                  checked={requiereEntrega}
                  onChange={(e) => setRequiereEntrega(e.target.checked)}
                  className="w-5 h-5 accent-[#E8579A]"
                />
                Sí, necesito entrega a domicilio
              </label>
              {requiereEntrega && (
                <div>
                  <label className={labelClass}>Dirección de entrega</label>
                  <input
                    type="text"
                    value={direccionEntrega}
                    onChange={(e) => setDireccionEntrega(e.target.value)}
                    placeholder="Calle, número, colonia, referencias"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ② Fecha y hora */}
          <section>
            <SectionTitle>② ¿Cuándo lo necesitas?</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fecha de entrega *</label>
                <input
                  type="date"
                  min={minFecha}
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Hora aproximada</label>
                <input
                  type="time"
                  value={horaEntrega}
                  onChange={(e) => setHoraEntrega(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            {fechaCercana && (
              <div className="mt-3 flex items-start gap-2 bg-[#FEF0E7] text-[#8B5E3C] text-sm font-['Plus_Jakarta_Sans'] p-3 rounded-xl">
                <Warning size={18} className="shrink-0 mt-0.5" />
                Los pedidos con menos de 3 días de anticipación requieren confirmación especial.
                Te contactaremos para validar disponibilidad.
              </div>
            )}
          </section>

          {/* ③ Tamaño */}
          <section>
            <SectionTitle>③ Tamaño del pastel</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>¿Para cuántas personas?</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={10}
                  step={5}
                  value={personas}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPersonas(v === "" ? "" : parseInt(v, 10));
                    setKilosEditadoManual(false);
                  }}
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                  Sugerimos {kilosSugeridos} kg para {personas || 0} personas
                </p>
              </div>
              <div>
                <label className={labelClass}>Kilos del pastel</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step={0.5}
                  value={kilos}
                  onChange={(e) => {
                    const v = e.target.value;
                    setKilos(v === "" ? "" : parseFloat(v));
                    setKilosEditadoManual(true);
                  }}
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                  {precioKiloEfectivo > 0
                    ? `${kilos || 0} kg × $${precioKiloEfectivo.toLocaleString("es-MX")}/kg = $${subtotalPastel.toLocaleString("es-MX")}`
                    : "Precio por kilo: a consultar — te confirmamos por WhatsApp"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className={labelClass}>Extras</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {extrasPastel.map((ex) => {
                  const seleccionado = !!extrasSeleccionados[ex.id];
                  const precio = Number(ex.precio) || 0;
                  return (
                    <label
                      key={ex.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors font-['Plus_Jakarta_Sans'] text-sm ${
                        seleccionado ? "border-[#E8579A] bg-[#FDEEF6]" : "border-[#F0DDD5] bg-white"
                      }`}
                    >
                      <span className="flex items-center gap-3 text-[#2C1A0E]">
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={(e) => toggleExtra(ex.id, e.target.checked)}
                          className="w-5 h-5 accent-[#E8579A]"
                        />
                        {ex.nombre}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          precio > 0 ? "text-[#5C2D1E]" : "text-[#7C5C52]"
                        }`}
                      >
                        {precio > 0 ? `$${precio.toLocaleString("es-MX")}` : "A consultar"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ④ Concepto */}
          <section>
            <SectionTitle>④ El concepto de tu pastel</SectionTitle>
            <p className="mb-4 text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
              💭 Aquí va la magia. Cuéntanos todo sobre tu pastel soñado.
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Concepto / Temática</label>
                <input
                  type="text"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  placeholder="XV años rosa y dorado, infantil dinosaurios, boda rústica..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Decorado</label>
                <textarea
                  rows={3}
                  value={decorado}
                  onChange={(e) => setDecorado(e.target.value)}
                  placeholder="Describe cómo quieres que se vea: flores, personajes, colores, estilo, detalles importantes..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Relleno</label>
                <RellenoSelector
                  value={rellenos}
                  rellenos={rellenosPastel}
                  precioKiloGlobal={precioKilo}
                  onChange={(relleno, precio) => {
                    setRellenos(relleno);
                    setRellenoPrecio(precio);
                  }}
                />
                <p className="mt-1.5 text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
                  Nuestra especialidad: tres leches con fruta natural 🍓
                </p>
              </div>
              <div>
                <label className={labelClass}>Leyenda en el pastel</label>
                <input
                  type="text"
                  maxLength={80}
                  value={leyenda}
                  onChange={(e) => setLeyenda(e.target.value)}
                  placeholder="El texto que irá escrito. Ej: 'Feliz cumple Ana 🎂'"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs font-['Plus_Jakarta_Sans'] text-[#7C5C52] text-right">
                  {leyenda.length}/80 caracteres
                </p>
              </div>
            </div>
          </section>

          {/* ⑤ Imagen de referencia */}
          <section>
            <SectionTitle>⑤ Imagen de inspiración (opcional)</SectionTitle>
            <p className="mb-4 text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52]">
              ¿Tienes una foto del pastel que te gustaría? Súbela aquí.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImagenChange}
              className="hidden"
            />
            {imagenPreview ? (
              <div className="relative inline-block">
                <img
                  src={imagenPreview}
                  alt="Imagen de referencia"
                  className="w-40 h-40 object-cover rounded-2xl border-2 border-[#F0DDD5]"
                />
                <button
                  type="button"
                  onClick={quitarImagen}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#E8579A] text-white flex items-center justify-center shadow-[0_4px_24px_rgba(92,45,30,0.15)]"
                  aria-label="Quitar imagen"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#F0DDD5] rounded-2xl py-10 flex flex-col items-center gap-3 text-[#7C5C52] hover:border-[#E8579A] hover:bg-[#FDEEF6]/50 transition-colors"
              >
                <Upload size={32} className="text-[#E8579A]" />
                <span className="font-['Plus_Jakarta_Sans'] text-sm">
                  Toca para seleccionar una imagen
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#C4A89A]">
                  JPG, PNG o WEBP · máximo 5MB
                </span>
              </button>
            )}
          </section>

          {/* ⑥ Sucursal */}
          <section>
            <SectionTitle>⑥ ¿En qué sucursal recoges tu pastel?</SectionTitle>
            <p className="mb-4 text-sm font-['Plus_Jakarta_Sans'] font-medium text-red-500">
              * Campo requerido — no podemos procesar el pedido sin sucursal
            </p>
            <SucursalSelector
              sucursales={sucursales}
              seleccionada={sucursalSeleccionada}
              onSelect={(s) => {
                setSucursalSeleccionada(s);
                setSinSucursalError(false);
              }}
              error={sinSucursalError}
            />
          </section>

          {/* ⑦ Notas */}
          <section>
            <SectionTitle>⑦ ¿Algo más que quieras decirnos?</SectionTitle>
            <textarea
              rows={4}
              value={notasAdicionales}
              onChange={(e) => setNotasAdicionales(e.target.value)}
              placeholder="Alergias, instrucciones de entrega, presupuesto aproximado, o cualquier cosa que quieras que sepamos..."
              className={inputClass}
            />
          </section>

          {/* Envío */}
          <section>
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 text-sm font-['Plus_Jakarta_Sans'] p-3 rounded-xl">
                {error}
              </div>
            )}
            <motion.button
              type="button"
              disabled={!puedeEnviar || enviando}
              onClick={handleEnviarPedido}
              whileHover={puedeEnviar && !enviando ? { scale: 1.01 } : {}}
              whileTap={puedeEnviar && !enviando ? { scale: 0.98 } : {}}
              className={`w-full inline-flex items-center justify-center gap-3 px-6 py-4 font-['Plus_Jakarta_Sans'] font-semibold text-base rounded-2xl transition-colors duration-200 ${
                puedeEnviar && !enviando
                  ? "bg-[#E8579A] text-white hover:bg-[#d44488]"
                  : "bg-[#F0DDD5] text-[#C4A89A] cursor-not-allowed"
              }`}
            >
              {enviando ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando tu pedido...
                </span>
              ) : (
                "Enviar mi pedido 🎂"
              )}
            </motion.button>
            <p className="text-center text-sm font-['Plus_Jakarta_Sans'] text-[#7C5C52] mt-3">
              Al enviar tu pedido, te contactaremos por WhatsApp para confirmar disponibilidad,
              detalles y precio final. Sin cobros en línea.
            </p>
          </section>
        </div>

        {/* Sidebar resumen (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <PrecioResumen
              kilos={kilos}
              precioKilo={precioKiloEfectivo}
              subtotalPastel={subtotalPastel}
              subtotalExtras={subtotalExtras}
              total={totalCalculado}
              sucursalNombre={sucursalSeleccionada?.nombre}
              fechaEntrega={fechaEntrega}
            />
          </div>
        </div>
      </div>

      {/* Barra de presupuesto móvil — solo en pantallas chicas */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F0DDD5] shadow-[0_-4px_24px_rgba(92,45,30,0.12)]">
        <button
          onClick={() => setMostrarResumenMovil((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm font-['Plus_Jakarta_Sans'] font-medium text-[#7C5C52]">
            Total estimado
          </span>
          <span className="flex items-center gap-2">
            <span className="font-['Playfair_Display'] text-xl font-bold text-[#E8579A]">
              {totalCalculado > 0
                ? `$${totalCalculado.toLocaleString("es-MX")}`
                : "A consultar"}
            </span>
            <ChevronUp
              className={`w-4 h-4 text-[#5C2D1E] transition-transform ${
                mostrarResumenMovil ? "" : "rotate-180"
              }`}
            />
          </span>
        </button>
        {mostrarResumenMovil && (
          <div className="px-4 pb-4 space-y-1.5 text-sm font-['Plus_Jakarta_Sans'] border-t border-[#F0DDD5] pt-3">
            <div className="flex justify-between">
              <span className="text-[#7C5C52]">Pastel</span>
              <span className="font-medium text-[#2C1A0E]">
                {precioKiloEfectivo > 0
                  ? `${kilos || 0} kg × $${precioKiloEfectivo.toLocaleString("es-MX")} = $${subtotalPastel.toLocaleString("es-MX")}`
                  : "A consultar"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C5C52]">Extras</span>
              <span className="font-medium text-[#2C1A0E]">
                {subtotalExtras > 0
                  ? `$${subtotalExtras.toLocaleString("es-MX")}`
                  : "A consultar"}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#F0DDD5] pt-1.5 font-bold">
              <span className="text-[#2C1A0E]">Total estimado</span>
              <span className="text-[#E8579A]">
                {totalCalculado > 0
                  ? `$${totalCalculado.toLocaleString("es-MX")}`
                  : "A consultar"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}