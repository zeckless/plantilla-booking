import { BookOpen, ChevronRight } from "lucide-react"

const sections = [
  {
    number: "1",
    title: "Acceso al panel",
    content: `El panel de administración está disponible en /admin/login.\n\nIngresa con tu contraseña configurada en el archivo .env (variable ADMIN_PASSWORD_HASH). Si estás en desarrollo local, la contraseña por defecto es admin1234.`,
    code: "tudominio.cl/admin/login",
  },
  {
    number: "2",
    title: "Liberar horarios (Disponibilidad)",
    content: `Antes de que los clientes puedan reservar, debes habilitar los horarios disponibles.\n\nVe a Agenda → Disponibilidad y selecciona los días y horas en que atiendes. Los clientes solo podrán reservar en los horarios que hayas liberado.\n\nSi una semana no trabajas, simplemente no liberes horarios para esa semana.`,
  },
  {
    number: "3",
    title: "Gestionar citas",
    content: `En Agenda → Calendario puedes ver todas las citas en vista mensual o diaria.\n\nAl hacer clic en una cita puedes:\n• Confirmar — pasar de Pendiente a Confirmada\n• Completar — marcar como realizada\n• Cancelar — libera el horario para que otro cliente pueda reservar\n• Marcar como No asistió`,
  },
  {
    number: "4",
    title: "Nueva cita manual",
    content: `Para crear una cita sin que el cliente pase por el flujo de reserva (reservas por teléfono o en persona):\n\nVe a Agenda → Nueva cita, completa los datos del cliente y selecciona si ya recibiste el abono en efectivo o transferencia.`,
  },
  {
    number: "5",
    title: "Servicios",
    content: `En Servicios puedes agregar, editar y desactivar los servicios que ofreces.\n\nCada servicio tiene:\n• Nombre y descripción\n• Duración en minutos\n• Precio total del servicio\n• Abono online (lo que el cliente paga al reservar)\n• Imagen opcional`,
  },
  {
    number: "6",
    title: "Consultas",
    content: `Aquí aparecen los mensajes enviados desde el formulario de contacto de tu sitio web.\n\nLos mensajes no leídos se muestran con un punto de color y un badge en el menú lateral. Al hacer clic en un mensaje se marca como leído automáticamente.\n\nPuedes responder directamente por email o WhatsApp desde el detalle del mensaje.`,
  },
  {
    number: "7",
    title: "Contenido del sitio",
    content: `En Contenido puedes personalizar lo que ven tus clientes en la página principal:\n\n• Hero — el título y subtítulo de bienvenida, y una foto de portada\n• Sobre mí — una sección con tu foto y descripción personal\n• Galería — fotos de tus trabajos (pega la URL de la imagen)\n• Video — un video de YouTube embebido`,
  },
  {
    number: "8",
    title: "Configuración general",
    content: `En Configuración puedes actualizar:\n• Nombre del negocio\n• Dirección\n• Teléfono e email de contacto\n• Usuario de Instagram\n• Embed de Google Maps para mostrar en la sección de contacto`,
  },
]

export default function ManualPage() {
  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Documentación</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Manual de uso</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Guía completa para usar el panel de administración.
        </p>
      </div>

      {/* Índice */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-3">Contenido</p>
        <div className="space-y-1">
          {sections.map((s) => (
            <a
              key={s.number}
              href={`#section-${s.number}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-ink-secondary hover:text-ink-primary hover:bg-black/[0.03] transition-all group"
            >
              <span className="text-[10px] font-bold text-ink-muted w-4 shrink-0">{s.number}.</span>
              {s.title}
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      {/* Secciones */}
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.number} id={`section-${s.number}`} className="bg-white rounded-2xl border border-black/[0.06] p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ink-primary/[0.06] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-ink-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">
                  Sección {s.number}
                </p>
                <h2 className="text-base font-semibold text-ink-primary">{s.title}</h2>
              </div>
            </div>

            <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-line pl-12">
              {s.content}
            </p>

            {s.code && (
              <div className="mt-4 ml-12 bg-black/[0.03] border border-black/[0.06] rounded-xl px-4 py-3">
                <code className="text-sm font-mono text-ink-primary">{s.code}</code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
