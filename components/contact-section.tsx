// Section Contact avec formulaire Web3Forms
// Design éditorial minimaliste, responsive
// Animations GSAP au scroll

"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }

      if (formRef.current) {
        gsap.from(formRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("sending")
    setErrorMessage("")

    try {
      const formData = new FormData(event.currentTarget)
      formData.append("access_key", "408e2714-dcb7-44d3-8a28-20c5a217fc3d")

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        if (formRef.current) formRef.current.reset()
        setTimeout(() => setStatus("idle"), 5000)
      } else {
        setStatus("error")
        setErrorMessage(data.message || "Une erreur est survenue.")
        setTimeout(() => setStatus("idle"), 5000)
      }
    } catch {
      setStatus("error")
      setErrorMessage("Impossible d'envoyer le message. Réessayez plus tard.")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-20 sm:py-32 pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12 border-t border-border/30"
    >
      {/* Header */}
      <div ref={headerRef} className="mb-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">07 / Contact</span>
        <h2 className="mt-4 font-(--font-bebas) text-4xl sm:text-5xl md:text-7xl tracking-tight">CONTACT</h2>
        <p className="mt-4 max-w-lg font-mono text-sm text-muted-foreground leading-relaxed">
          Une question, une collaboration ou un projet ? N'hésitez pas à me contacter.
        </p>
      </div>

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="max-w-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-name"
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Nom
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              placeholder="Votre nom"
              className="w-full bg-transparent border-b border-border/60 focus:border-accent py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-300"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-email"
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              placeholder="votre@email.com"
              className="w-full bg-transparent border-b border-border/60 focus:border-accent py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-300"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-2 mb-6">
          <label
            htmlFor="contact-subject"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
          >
            Objet
          </label>
          <input
            id="contact-subject"
            type="text"
            name="subject"
            placeholder="Objet du message (optionnel)"
            className="w-full bg-transparent border-b border-border/60 focus:border-accent py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-300"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2 mb-8">
          <label
            htmlFor="contact-message"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            placeholder="Votre message..."
            className="w-full bg-transparent border-b border-border/60 focus:border-accent py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors duration-300 resize-none"
          />
        </div>

        {/* Submit + Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            type="submit"
            disabled={status === "sending"}
            className={cn(
              "inline-flex items-center gap-3 px-8 py-3 border font-mono text-[11px] uppercase tracking-[0.2em] transition-all duration-300",
              status === "sending"
                ? "border-muted-foreground/30 text-muted-foreground cursor-wait"
                : "border-accent/60 text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent"
            )}
          >
            {status === "sending" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer
              </>
            )}
          </button>

          {/* Status feedback */}
          {status === "success" && (
            <div className="flex items-center gap-2 font-mono text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              Message envoyé avec succès !
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 font-mono text-xs text-red-500">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}
        </div>
      </form>
    </section>
  )
}
