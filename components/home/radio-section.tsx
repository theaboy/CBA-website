// components/home/radio-section.tsx
import Link from "next/link";
import { Headphones, ArrowRight } from "lucide-react";
import styles from "./radio-section.module.css";
import { getFeaturedEpisode, radioEpisodes, BAR_CONFIG, formatDate } from "@/lib/radio/catalog";

export function RadioSection() {
  const featured = getFeaturedEpisode();
  const recent = radioEpisodes.filter((e) => e.id !== featured.id).slice(0, 4);

  return (
    <section
      id="listen"
      aria-labelledby="radio-home-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              <span className={styles.liveDot} aria-hidden />
              Radio CBA · Archives
            </p>
            <h2 id="radio-home-heading" className={styles.title}>
              La Fréquence CBA
            </h2>
          </div>
          <Link href="/radio" className={styles.headerLink}>
            <Headphones size={13} />
            Toutes les émissions
          </Link>
        </header>

        <div className={styles.grid}>
          {/* Featured episode */}
          <div className={styles.featured}>
            <div className={styles.featuredMeta}>
              <span className={styles.genrePill}>{featured.genre}</span>
              <span className={styles.dur}>{featured.duration}</span>
            </div>

            <div>
              <h3 className={styles.episodeTitle}>{featured.title}</h3>
              <p className={styles.episodeHost}>{featured.host} · {formatDate(featured.date)}</p>
            </div>

            <p className={styles.episodeDesc}>{featured.description}</p>

            <div className={styles.equalizer} aria-hidden>
              {BAR_CONFIG.map((bar, i) => (
                <div
                  key={i}
                  className={styles.bar}
                  style={{
                    "--bar-duration": `${bar.d}s`,
                    height: `${bar.h}%`,
                    animationDelay: `${(i * 0.07).toFixed(2)}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            <Link href="/radio" className={styles.listenBtn}>
              <Headphones size={14} />
              Écouter l&apos;épisode
            </Link>
          </div>

          {/* Recent episodes list */}
          <div className={styles.recentPanel}>
            <p className={styles.panelLabel}>Épisodes récents</p>

            {recent.map((ep, i) => (
              <div key={ep.id} className={styles.recentRow}>
                <span className={styles.recentNum}>{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.recentInfo}>
                  <strong>{ep.title}</strong>
                  <span>{ep.host} · {formatDate(ep.date)}</span>
                </div>
                <span className={styles.recentDur}>{ep.duration}</span>
              </div>
            ))}

            <Link href="/radio" className={styles.archiveLink}>
              Voir toutes les émissions <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
