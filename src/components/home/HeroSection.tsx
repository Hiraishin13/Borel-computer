'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SITE } from '@/lib/constants'
import { fadeInUp, staggerContainer } from '@/lib/animations'

export function HeroSection() {
  return (
    <section className="relative flex h-screen min-h-[600px] items-center justify-center overflow-hidden bg-primary">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container-page relative z-10 text-center"
      >
        <motion.p variants={fadeInUp} className="text-sm uppercase tracking-[0.3em] text-accent">
          Boutique informatique haut de gamme
        </motion.p>
        <motion.h1
          variants={fadeInUp}
          className="mx-auto mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-6xl"
        >
          {SITE.tagline}
        </motion.h1>
        <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-xl text-muted">
          PC gaming, composants premium et configurations sur mesure assemblées par nos experts.
        </motion.p>
        <motion.div variants={fadeInUp} className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button href="/products">Découvrir le catalogue</Button>
          <Button href="/configurator" variant="secondary">
            Configurer mon PC
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted"
      >
        ↓
      </motion.div>
    </section>
  )
}
