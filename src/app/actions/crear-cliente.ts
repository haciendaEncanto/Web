"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// ─── Schema ───────────────────────────────────────────────────────────

const schema = z
  .object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().min(7, "Ingresa un número de teléfono válido"),
    address: z.string().min(4, "Ingresa la dirección de residencia"),
    email: z.string().email("El correo electrónico no es válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener mínimo 8 caracteres"),
    event_type: z.enum(["boda", "quince", "empresarial", "revelacion"] as const, {
      message: "Selecciona el tipo de evento",
    }),
    event_date: z.string().min(1, "La fecha del evento es requerida"),
    event_start_time: z.string().min(1, "La hora de inicio es requerida"),
    event_end_time: z.string().min(1, "La hora de fin es requerida"),
    guest_count: z.coerce
      .number()
      .int()
      .min(1, "Mínimo 1 invitado"),
  })
  .refine(
    (d) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(d.event_date + "T00:00:00") >= today;
    },
    { message: "La fecha del evento no puede ser en el pasado", path: ["event_date"] }
  );

// ─── Tipos ────────────────────────────────────────────────────────────

export type CreateClientState =
  | { error: string; field?: string }
  | { success: true; bookingId: string }
  | null;

// ─── Action ───────────────────────────────────────────────────────────

export async function createClientAction(
  _prev: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  // 0 — Verificar que el llamador es planner o admin
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
  if (!caller) return { error: "No autenticado" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (
    !callerProfile ||
    !["admin", "wedding_planner"].includes(callerProfile.role)
  ) {
    return { error: "Sin permisos para crear clientes" };
  }

  // 1 — Validar datos del formulario
  const raw = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    email: formData.get("email"),
    password: formData.get("password"),
    event_type: formData.get("event_type"),
    event_date: formData.get("event_date"),
    event_start_time: formData.get("event_start_time"),
    event_end_time: formData.get("event_end_time"),
    guest_count: formData.get("guest_count"),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first.message, field: first.path[0] as string };
  }

  const d = parsed.data;
  const admin = createAdminClient();

  let createdUserId: string | null = null;
  let createdBookingId: string | null = null;

  try {
    // 2 — Crear usuario en Supabase Auth
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: d.email,
        password: d.password,
        email_confirm: true,
        user_metadata: { full_name: d.full_name },
      });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return { error: "Este correo ya está registrado", field: "email" };
      }
      return { error: `Error al crear usuario: ${authError.message}` };
    }

    createdUserId = authData.user.id;

    // 3 — Actualizar perfil (el trigger handle_new_user ya lo creó con email + full_name)
    //     Usamos admin client porque la policy de profiles update solo permite is_admin()
    const { error: profileError } = await admin
      .from("profiles")
      .update({ phone: d.phone, address: d.address })
      .eq("id", createdUserId);

    if (profileError) {
      throw new Error(`Error actualizando perfil: ${profileError.message}`);
    }

    // 4 — Obtener el espacio principal (único espacio del local)
    const { data: space } = await supabase
      .from("spaces")
      .select("id")
      .eq("slug", "salon-principal")
      .maybeSingle();

    const spaceId = space?.id;
    if (!spaceId) {
      throw new Error("No se encontró el espacio 'salon-principal' en la base de datos");
    }

    // 4b — Crear reserva (usando el SSR client del planner para respetar contexto de sesión)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        client_id: createdUserId,
        space_id: spaceId,
        event_type: d.event_type,
        event_date: d.event_date,
        event_start_time: d.event_start_time,
        event_end_time: d.event_end_time,
        guest_count: d.guest_count,
        status: "pending",
        total_amount: 0,
      })
      .select("id")
      .single();

    if (bookingError) {
      throw new Error(`Error creando reserva: ${bookingError.message}`);
    }

    createdBookingId = booking.id;

    // 5 — Inicializar orden de servicio
    const { error: orderError } = await supabase.rpc(
      "initialize_service_order",
      { p_booking_id: createdBookingId }
    );

    if (orderError) {
      throw new Error(`Error inicializando orden: ${orderError.message}`);
    }

    return { success: true, bookingId: createdBookingId };
  } catch (err) {
    // Rollback en orden inverso
    if (createdBookingId) {
      await admin.from("bookings").delete().eq("id", createdBookingId);
    }
    if (createdUserId) {
      await admin.auth.admin.deleteUser(createdUserId);
    }
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { error: msg };
  }
}
