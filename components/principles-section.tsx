// Section Parcours / Expériences du portfolio
// Affiche les expériences professionnelles et académiques avec un alignement alterné gauche/droite
// Le dernier mot de chaque titre est mis en valeur avec le composant HighlightText
// Animations GSAP au scroll : glissement alterné depuis la gauche ou la droite

"use client"

import { useRef, useEffect } from "react"
import { HighlightText } from "@/components/highlight-text"
import { experiences } from "@/lib/data"
import { parseMarkdown } from "@/lib/markdown"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  // Animations GSAP au montage : titre + articles avec glissement alterné
  useEffect(() => {
    if (!sectionRef.current || !headerRef.current || !itemsRef.current) return

    const ctx = gsap.context(() => {
      // Animation du titre : glissement depuis la gauche
      gsap.from(headerRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      })

      // Chaque expérience glisse en alternance depuis la gauche ou la droite
      const articles = itemsRef.current?.querySelectorAll("article")
      articles?.forEach((article, index) => {
        const isRight = index % 2 !== 0
        gsap.from(article, {
          x: isRight ? 80 : -80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: article,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="cv" className="relative py-20 sm:py-32 pl-4 sm:pl-6 md:pl-28 pr-4 sm:pr-6 md:pr-12">
      {/* En-tête de la section avec numéro et titre */}
      <div ref={headerRef} className="mb-24">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">06 / Parcours</span>
        <h2 className="mt-4 font-[var(--font-bebas)] text-4xl sm:text-5xl md:text-7xl tracking-tight">EXPÉRIENCES</h2>
      </div>

      {/* Liste des expériences avec espacement et alignement alterné */}
      <div ref={itemsRef} className="space-y-24 md:space-y-32">
        {experiences.map((exp, index) => {
          const align = index % 2 === 0 ? "left" : "right"
          const titleWords = exp.title.split(" ")
          const highlightWord = titleWords[titleWords.length - 1]
          const restWords = titleWords.slice(0, -1).join(" ")

          return (
            <article
              key={index}
              className={`flex flex-col ${
                align === "right" ? "items-end text-right" : "items-start text-left"
              }`}
            >
              {/* Label annoté avec numéro et période */}
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                {String(index + 1).padStart(2, "0")} / {exp.period}
              </span>

              <h3 className="font-[var(--font-bebas)] text-4xl md:text-6xl lg:text-8xl tracking-tight leading-none">
                {restWords && <span>{restWords} </span>}
                <HighlightText parallaxSpeed={0.6}>
                  {highlightWord}
                </HighlightText>
              </h3>

              {/* Lieu de l'expérience */}
              <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-accent/70">
                {exp.place}
              </span>

              {/* Description détaillée */}
              <p className="mt-4 max-w-md font-mono text-sm text-muted-foreground leading-relaxed">
                {parseMarkdown(exp.description)}
              </p>

              {/* Ligne décorative séparatrice */}
              <div className={`mt-8 h-[1px] bg-border w-24 md:w-48 ${align === "right" ? "mr-0" : "ml-0"}`} />
            </article>
          )
        })}
      </div>
    </section>
  )
}

export { PrinciplesSection }
