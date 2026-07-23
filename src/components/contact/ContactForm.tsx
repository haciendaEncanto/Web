"use client";

import { useActionState, startTransition, useEffect, useRef } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { SubmitButton } from "@/components/ui/SubmitButton";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;


const inputClass =
  "w-full border border-crema-medio bg-blanco px-4 py-3 text-negro text-sm placeholder:text-gris-claro focus:outline-none focus:border-dorado transition-colors duration-150";

const labelClass = "block text-xs text-gris uppercase tracking-wider mb-2";

export function ContactForm() {
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
          const t = await window.grecaptcha.execute(SITE_KEY, { action: "contact" });
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
          <svg className="w-6 h-6 text-verde" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-serif text-xl text-negro mb-2">¡Mensaje recibido!</p>
        <p className="text-sm text-gris">
          Nos pondremos en contacto contigo muy pronto.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* recaptchaToken se inyecta en handleSubmit */}
      <input type="hidden" name="recaptchaToken" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Nombre
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Tu nombre"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Correo
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="tu@correo.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-whatsapp" className={labelClass}>
            WhatsApp *
          </label>
          <input
            id="contact-whatsapp"
            name="whatsapp"
            type="tel"
            required
            placeholder="+57 3XX XXX XXXX"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className={labelClass}>
            Tipo de evento <span className="normal-case text-gris-claro">(opcional)</span>
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder="Boda, quinceaños, empresarial…"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Cuéntanos tu evento
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="¿Cuántos invitados? ¿Qué fecha tienes en mente? ¿Qué necesitas?"
          className={`${inputClass} resize-none`}
        />
      </div>

      {state?.error && (
        <p className="text-rojo text-sm" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton
        label="Cuéntanos tu evento"
        pendingLabel="Enviando…"
        className="w-full bg-rojo text-blanco py-3 font-serif tracking-wider text-sm hover:bg-rojo-pro"
      />

      <p className="text-[0.65rem] text-gris-claro text-center leading-relaxed">
        Protegido por reCAPTCHA —{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gris">
          Política de privacidad
        </a>{" "}
        y{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gris">
          Términos de servicio
        </a>{" "}
        de Google.
      </p>
    </form>
  );
}
