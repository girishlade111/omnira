import { HeroPortrait } from '@/components/graphics';
import { SectionFrame } from '@/components/layout';
import { HeroHeadline } from '@/components/motion';
import { ChamferedButton, StatusIndicator, TechnicalBadge } from '@/components/primitives';
import { siteConfig } from '@/config/site';
import styles from './home.module.css';

export function Hero() {
  const { hero } = siteConfig;

  return (
    <SectionFrame ariaLabel="Hero" padding="none" bottomBorder>
      <div className={styles.heroWrap}>
        <div className={styles.heroMainGrid}>
          <div className={styles.heroLeft}>
            <TechnicalBadge label={hero.badge} />

            <HeroHeadline
              prefix={hero.headlinePrefix}
              words={hero.rotatingWords}
              intervalMs={hero.rotationIntervalMs}
              durationMs={hero.rotationDurationMs}
              as="h1"
            />

            <p className={styles.heroDesc}>{hero.description}</p>

            <div className={styles.heroCtas}>
              <ChamferedButton href={hero.primaryCtaHref} variant="primary" size="md">
                {hero.primaryCtaLabel}
              </ChamferedButton>
              <ChamferedButton
                href={hero.secondaryCtaHref}
                variant="secondary"
                size="md"
                showCornerTriangles={false}
              >
                {hero.secondaryCtaLabel}
              </ChamferedButton>
            </div>
          </div>

          <div className={styles.heroRight}>
            <HeroPortrait className={styles.heroPortraitBox} />
          </div>
        </div>

        <div className={styles.heroBottomBar}>
          <StatusIndicator label="STATUS:" value={hero.statusText} color="green" pulse />
          <div className={styles.heroRuleWrap} aria-hidden="true">
            <span className={styles.heroRuleAccent} />
            <span className={styles.heroRuleLine} />
          </div>
          <a href="#selected-work" className={styles.scrollHintLink}>
            <span>{hero.scrollHint}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
        </div>
      </div>
    </SectionFrame>
  );
}
