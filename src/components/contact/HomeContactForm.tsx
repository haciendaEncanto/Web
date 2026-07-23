"use client";

import { useActionState, startTransition, useEffect, useRef } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { SubmitButton } from "@/components/ui/SubmitButton";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const input =
  "w-full px-4 py-3 border border-crema-medio rounded-lg bg-crema text-negro text-[0.9rem] focus:outline-none focus:border-rojo transition-colors duration-200";
const label =
  "block text-[0.8rem] text-gris tracking-[1px] uppercase mb-1 font-medium";

export function HomeContactForm() {
  const [state, formAction] = useActionState(submitContactForm, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (SITE_KEY && window.grecaptcha) {
      const token = await new Promise<string>((resolve) => {
        window.grecaptcha.ready(async () => {
          const t = await window.grecaptcha.execute(SITE_KEY, {
            action: "contact",
          });
          resolve(t);
        });
      });
      formData.set("recaptchaToken", token);
    }

    startTransition(() => formAction(formData));
  }

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-verde/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-verde"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="font-serif text-xl text-negro mb-2">¡Mensaje enviado!</p>
        <p className="text-[0.85rem] text-gris">
          Nos pondremos en contacto contigo en menos de 24 horas.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="recaptchaToken" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Nombre completo</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Tu nombre"
            className={input}
          />
        </div>
        <div>
          <label className={label}>
            WhatsApp <span className="normal-case text-rojo">*</span>
          </label>
          <input
            name="whatsapp"
            type="tel"
            required
            placeholder="+57 3XX XXX XXXX"
            className={input}
          />
        </div>
      </div>

      <div>
        <label className={label}>Correo electrónico</label>
        <input
          name="email"
          type="email"
          required
          placeholder="tu@correo.com"
          className={input}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Tipo de evento</label>
          <select name="subject" className={input}>
            <option value="">Selecciona…</option>
            <option>Boda</option>
            <option>Quince Años</option>
            <option>Evento Empresarial</option>
            <option>Revelación de Género</option>
            <option>Otro</option>
          </select>
        </div>
        <div>
          <label className={label}>Fecha estimada</label>
          <input name="event_date" type="date" className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Número de invitados</label>
        <input
          name="guest_count"
          type="number"
          placeholder="Ej: 150"
          min="1"
          className={input}
        />
      </div>

      <div>
        <label className={label}>Cuéntanos sobre tu evento</label>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="¿Qué tienes en mente? Cuéntanos sobre tu evento ideal…"
          className={`${input} resize-y`}
        />
      </div>

      {state?.error && (
        <p className="text-rojo text-sm" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton
        label="Enviar mensaje"
        pendingLabel="Enviando…"
        className="w-full text-center bg-rojo text-blanco px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase hover:bg-rojo-pro transition-colors duration-300"
      />
    </form>
  );
}
