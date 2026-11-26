'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionFrame } from '@/components/layout/SectionFrame';
import {
  ChamferedPanel,
  ExternalLinkIndicator,
  SectionHeading,
} from '@/components/primitives';
import { testimonialsContent } from '@/content/testimonials';
import { ClientRating } from './ClientRating';
import { PartnerLogoPanel } from './PartnerLogoPanel';
import styles from './common.module.css';

export function TestimonialsSection() {
  const items = testimonialsContent.items;
  const total = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const syncViewportCount = () => {
      if (window.innerWidth >= 1200) setVisibleCount(3);
      else if (window.innerWidth >= 810) setVisibleCount(2);
      else setVisibleCount(1);
    };
    syncViewportCount();
    window.addEventListener('resize', syncViewportCount);
    return () => window.removeEventListener('resize', syncViewportCount);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const visibleItems = Array.from({ length: visibleCount }, (_, offset) => {
    return items[(activeIndex + offset) % total];
  });

  return (
    <SectionFrame id="testimonials" bottomBorder>
      <div className={styles.testimonialsHeaderRow}>
        <SectionHeading
          badge={testimonialsContent.badge}
          titleWhite="TRUSTED BY"
          titleOrange="BOLD TEAMS"
          description={testimonialsContent.description}
          align="split"
          showOrangeRule
        />

        <div className={styles.carouselControls}>
          <button
            type="button"
            className={styles.carouselButton}
            aria-label="Previous testimonial"
            onClick={handlePrev}
          >
            <img
              src={testimonialsContent.controls.arrowLeftSvg}
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            className={styles.carouselButton}
            aria-label="Next testimonial"
            onClick={handleNext}
          >
            <img
              src={testimonialsContent.controls.arrowRightSvg}
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div
        className={styles.carouselViewport}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            handlePrev();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            handleNext();
          }
        }}
      >
        <div className={styles.carouselGrid}>
          {visibleItems.map((item) => (
            <ChamferedPanel
              key={`${activeIndex}-${item.index}`}
              cornerCut={12}
              borderColor="rgba(255, 255, 255, 0.14)"
              backgroundColor="rgba(255, 255, 255, 0.02)"
              className={styles.testimonialCardPanel}
              innerClassName={styles.testimonialCardInner}
            >
              <blockquote className={styles.testimonialQuote}>
                {`"${item.quote}"`}
              </blockquote>

              <div className={styles.testimonialAuthorRow}>
                <div className={styles.testimonialAuthorLeft}>
                  <div className={styles.testimonialAvatarFrame}>
                    <picture>
                      <source type="image/avif" srcSet={item.avatar.avif} />
                      <source type="image/webp" srcSet={item.avatar.webp} />
                      <img
                        src={item.avatar.fallback}
                        alt={item.avatar.alt}
                        width={44}
                        height={44}
                        loading="lazy"
                        decoding="async"
                        className={styles.testimonialAvatarImg}
                      />
                    </picture>
                  </div>
                  <div className={styles.testimonialAuthorMeta}>
                    <p className={styles.testimonialAuthorName}>{item.name}</p>
                    <p className={styles.testimonialAuthorRole}>{item.roleAndCompany}</p>
                  </div>
                </div>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.name} profile on X`}
                  className={styles.testimonialExternalLink}
                >
                  <ExternalLinkIndicator size={14} />
                </a>
              </div>
            </ChamferedPanel>
          ))}
        </div>
      </div>

      <div className={styles.slideDots} role="tablist" aria-label="Testimonial slides">
        {items.map((item, idx) => (
          <button
            key={item.index}
            type="button"
            role="tab"
            aria-selected={idx === activeIndex}
            aria-label={`Show testimonial ${idx + 1} of ${total}`}
            onClick={() => setActiveIndex(idx)}
            className={
              idx === activeIndex
                ? `${styles.slideDot} ${styles.slideDotActive}`
                : styles.slideDot
            }
          />
        ))}
      </div>

      <div className={styles.testimonialsBentoRow}>
        <ClientRating />
        <PartnerLogoPanel />
      </div>
    </SectionFrame>
  );
}
