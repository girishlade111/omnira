import { SectionFrame } from '@/components/layout';
import {
  AnimatedCounter,
  ChamferedPanel,
  CornerMarker,
  OrangeText,
  TechnicalBadge,
} from '@/components/primitives';
import { profileContent } from '@/content/profile';
import styles from './about.module.css';

export function ProfileHero() {
  return (
    <SectionFrame ariaLabel="Profile system overview" bottomBorder>
      <div className={styles.heroGrid}>
        <div className={styles.heroLeft}>
          <TechnicalBadge label={profileContent.heroBadge} />

          <h1 className={styles.heroTitle}>
            <span>BUILD WITH</span>
            <br />
            <span>CLEAR</span>
            <br />
            <OrangeText>DIRECTION</OrangeText>
          </h1>

          <p className={styles.heroDescription}>{profileContent.heroDescription}</p>

          <div className={styles.heroRuleRow} aria-hidden="true">
            <span className={styles.heroOrangeRule} />
            <span className={styles.heroHairlineRule} />
          </div>

          <div className={styles.statsRow}>
            {profileContent.stats.map((stat) => (
              <ChamferedPanel
                key={stat.id}
                cornerCut={8}
                borderColor="rgba(255, 255, 255, 0.12)"
                backgroundColor="rgba(255, 255, 255, 0.02)"
                className={styles.statCard}
                innerClassName={styles.statCardInner}
              >
                <div className={styles.statValue}>
                  <AnimatedCounter value={`${stat.value}${stat.suffix}`} />
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </ChamferedPanel>
            ))}
          </div>

          <ChamferedPanel
            cornerCut={8}
            borderColor="rgba(255, 255, 255, 0.12)"
            backgroundColor="rgba(255, 255, 255, 0.02)"
            className={styles.focusPanel}
            innerClassName={styles.focusPanelInner}
          >
            <div className={styles.focusCol}>
              <span className={styles.focusHeading}>{profileContent.focusLabel}</span>
              <p className={styles.focusText}>{profileContent.focusValue}</p>
            </div>
            <div className={styles.focusCol}>
              <span className={styles.focusHeading}>{profileContent.toolsLabel}</span>
              <p className={styles.focusText}>{profileContent.toolsSummary}</p>
            </div>
          </ChamferedPanel>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.portraitFrame}>
            <CornerMarker size={8} thickness={1.5} inset={0} color="var(--color-accent)" styleType="line" />
            <div className={styles.portraitGridOverlay} aria-hidden="true" />
            <picture className={styles.portraitPicture}>
              <source type="image/avif" srcSet={profileContent.portrait.avif} />
              <source type="image/webp" srcSet={profileContent.portrait.webp} />
              <img
                src={profileContent.portrait.fallback}
                alt={profileContent.portrait.alt}
                width={profileContent.portrait.width}
                height={profileContent.portrait.height}
                className={styles.portraitImg}
              />
            </picture>
            <span className={styles.portraitBottomMarker} aria-hidden="true" />
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
