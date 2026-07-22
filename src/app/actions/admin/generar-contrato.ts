"use server";

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { ContratoPDF } from "@/components/contrato/ContratoPDF";
import {
  DEFAULT_CONTRACT_ITEMS,
  CLAUSULA_KEYS,
  FIRMA_KEY,
  HACIENDA_CONTENT_KEYS,
  resolveHaciendaData,
  type ContractItems,
} from "@/lib/contract-items";
import { generatedContractPath } from "@/lib/uploads/config";

async function verifyPlanner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" as string, userId: "" };
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "wedding_planner"].includes(profile.role))
    return { error: "Sin permisos" as string, userId: "" };
  return { error: null, userId: user.id };
}

export async function generarContratoPDF(
  clientId: string,
  otroSi?: string,
): Promise<{ documentId?: string; error?: string }> {
  const { error: authErr, userId } = await verifyPlanner();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();

  // Fetch datos del cliente
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, phone, address, cc")
    .eq("id", clientId)
    .single();
  if (!profile) return { error: "Cliente no encontrado" };

  if (!profile.cc) return { error: "El cliente no tiene CC registrada. Edita su perfil primero." };
  if (!profile.address) return { error: "El cliente no tiene dirección registrada." };

  // Fetch booking activo
  const { data: booking } = await admin
    .from("bookings")
    .select("id, event_type, event_date, event_start_time, event_end_time, guest_count, capilla, valor_total, valor_anticipo, fecha_segundo_abono, fecha_tercer_abono, contract_items, status")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (!booking) return { error: "No se encontró un evento activo para este cliente" };
  if (!booking.valor_total) return { error: "Ingresa el valor total del evento antes de generar el contrato." };
  if (!booking.valor_anticipo) return { error: "Ingresa el valor del anticipo antes de generar el contrato." };

  // Fetch cláusulas, firma y datos editables de la hacienda
  const allContentKeys = [
    ...CLAUSULA_KEYS,
    FIRMA_KEY,
    ...Object.values(HACIENDA_CONTENT_KEYS),
  ];
  const { data: contentRows } = await admin
    .from("site_content")
    .select("key, content")
    .in("key", allContentKeys);

  const contentMap: Record<string, string | null> = {};
  for (const r of contentRows ?? []) contentMap[r.key] = r.content ?? null;

  const clauses = CLAUSULA_KEYS.map((k) => contentMap[k] ?? "");
  const firmaUrl = contentMap[FIRMA_KEY] ?? null;
  const haciendaData = resolveHaciendaData(contentMap);

  // Determinar número de versión
  const { count } = await admin
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("booking_id", booking.id)
    .eq("type", "contrato");
  const version = (count ?? 0) + 1;

  // Generar PDF
  const generatedAt = new Date().toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const pdfBuffer = await renderToBuffer(
    React.createElement(ContratoPDF, {
      clientName: profile.full_name ?? profile.email,
      clientCc: profile.cc,
      clientPhone: profile.phone ?? "",
      clientAddress: profile.address ?? "",
      clientEmail: profile.email,
      eventType: booking.event_type ?? "boda",
      eventDate: booking.event_date ?? "",
      eventStartTime: booking.event_start_time ?? "",
      eventEndTime: booking.event_end_time ?? "",
      guestCount: booking.guest_count ?? 0,
      capilla: booking.capilla ?? null,
      valorTotal: booking.valor_total,
      valorAnticipo: booking.valor_anticipo,
      fechaSegundoAbono: booking.fecha_segundo_abono ?? null,
      fechaTercerAbono: booking.fecha_tercer_abono ?? null,
      contractItems: (booking.contract_items as ContractItems | null) ?? DEFAULT_CONTRACT_ITEMS,
      clauses,
      firmaUrl,
      version,
      generatedAt,
      otroSi: otroSi?.trim() || undefined,
      haciendaData,
    })
  );

  // Subir a Storage (servidor, sin signed URL)
  const storagePath = generatedContractPath(booking.id, version);
  const { error: uploadErr } = await admin.storage
    .from("documents")
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: false });
  if (uploadErr) return { error: `Error al subir el PDF: ${uploadErr.message}` };

  // Insertar en documents
  const title = `Contrato de servicios v${version} — ${new Date().toLocaleDateString("es-CO")}`;
  const { data: inserted, error: dbErr } = await admin
    .from("documents")
    .insert({
      booking_id: booking.id,
      title,
      file_url: storagePath,
      type: "contrato",
      created_by: userId,
    })
    .select("id")
    .single();

  if (dbErr || !inserted) {
    void admin.storage.from("documents").remove([storagePath]);
    return { error: dbErr?.message ?? "Error al guardar el documento" };
  }

  // Notificar al cliente
  await admin.from("notifications").insert({
    user_id: clientId,
    title: "Tu contrato está listo",
    body: "El equipo de Hacienda El Encanto ha generado el contrato de tu evento. Puedes revisarlo en la sección Documentos.",
    type: "new_document",
  });

  revalidatePath("/portal/documentos");
  revalidatePath(`/portal/planner/clientes/${clientId}/documentos`);
  revalidatePath(`/admin/clientes/${clientId}/documentos`);
  return { documentId: inserted.id };
}
