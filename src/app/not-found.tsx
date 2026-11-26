import type { Metadata } from 'next';
import { SectionFrame } from '@/components/layout';
import {
  ChamferedButton,
  ChamferedPanel,
  CornerMarker,
  TechnicalBadge,
} from '@/components/primitives';
import { siteConfig } from '@/config/site';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: siteConfig.notFound.description,
};

export default function NotFoundPage() {
  const { notFound } = siteConfig;

  return (
    <SectionFrame ariaLabel="Page not found" bottomBorder>
      <div className={styles.root}>
        <div className={styles.leftCol}>
          <TechnicalBadge label={notFound.badge} />
          <p className={styles.code} aria-hidden="true">
            {notFound.code}
          </p>
          <h1 className={styles.heading}>{notFound.heading}</h1>
          <p className={styles.description}>{notFound.description}</p>
          <div className={styles.actions}>
            <ChamferedButton href={notFound.primaryCtaHref} variant="primary" size="md">
              {notFound.primaryCtaLabel}
            </ChamferedButton>
            <ChamferedButton
              href={notFound.secondaryCtaHref}
              variant="secondary"
              size="md"
              showCornerTriangles={false}
            >
              {notFound.secondaryCtaLabel.toUpperCase()}
            </ChamferedButton>
          </div>
        </div>

        <div className={styles.rightCol}>
          <ChamferedPanel
            cornerCut={8}
            borderColor="rgba(255, 255, 255, 0.12)"
            backgroundColor="#060606"
            className={styles.portalFrame}
            innerClassName={styles.portalInner}
          >
            <CornerMarker size={8} thickness={1.5} inset={4} color="var(--color-accent)" styleType="line" />
            <picture className={styles.portalPicture}>
              <source type="image/avif" srcSet="/assets/images/brand/not-found-portal.avif" />
              <source type="image/webp" srcSet="/assets/images/brand/not-found-portal.webp" />
              <img
                src="/assets/images/brand/not-found-portal.jpg"
                alt="Glowing amber circular portal inside dark architectural corridor"
                width={1200}
                height={630}
                className={styles.portalImg}
              />
            </picture>
          </ChamferedPanel>
        </div>
      </div>
    </SectionFrame>
  );
}
