"use client";

import { ScrollHero } from "@/components/home/scroll-hero";
import { EditorialCatalog } from "@/components/home/editorial-catalog";
import { StudioSectionMockup } from "@/components/home/studio-section-mockup";
import { AboutSection } from "@/components/home/about-section";
import { EventsSection } from "@/components/home/events-section";
import { CtaBand } from "@/components/home/cta-band";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <>
      <ScrollHero />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
      >
        <EditorialCatalog />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
      >
        <StudioSectionMockup />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      >
        <EventsSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <AboutSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        <CtaBand />
      </motion.div>
    </>
  );
}
