import { SectionFrame } from '@/components/layout';
import {
  ChamferedButton,
  ChamferedPanel,
  SectionHeading,
} from '@/components/primitives';
import { pricingContent } from '@/content/pricing';
import type { PricingTier } from '@/types';
import styles from './home.module.css';

function TierIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2.5" y="3.5" width="11" height="9" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 1:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2L13 4.8V11.2L8 14L3 11.2V4.8L8 2Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M5.5 4.5L2.5 8L5.5 11.5M10.5 4.5L13.5 8L10.5 11.5M9 3.5L7 12.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
  }
}

export function PricingCard({
  tier,
  index,
}: {
  tier: PricingTier;
  index: number;
}) {
  return (
    <ChamferedPanel
      cornerCut={11}
      borderColor={tier.featured ? '#ff9800' : 'rgba(255, 255, 255, 0.14)'}
      hoverBorderColor="rgba(255, 152, 0, 0.7)"
      backgroundColor={tier.featured ? '#0f0d0a' : '#0b0b0b'}
      showGrain
      grainOpacity={0.55}
      className={`${styles.pricingCard} ${tier.featured ? styles.pricingCardFeatured : ''}`.trim()}
      innerClassName={styles.pricingCardInner}
    >
      <div className={styles.pricingHeader}>
        <div className={styles.pricingHeaderLeft}>
          <span
            className={`${styles.pricingIconBox} ${
              tier.featured ? styles.pricingIconBoxFeatured : ''
            }`.trim()}
          >
            <TierIcon index={index} />
          </span>
          <div>
            <h3 className={styles.pricingPlanName}>{tier.planName.toUpperCase()}</h3>
            <p className={styles.pricingPlanDesc}>{tier.description}</p>
          </div>
        </div>
        <span className={styles.panelDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>

      <div className={styles.pricingPriceRow}>
        <span className={styles.pricingAmount}>{tier.formattedPrice}</span>
        <span className={styles.pricingCurrency}>{tier.currency}</span>
      </div>

      <ul className={styles.pricingFeatures}>
        {tier.features.map((feat) => (
          <li key={feat} className={styles.pricingFeatureItem}>
            <span className={styles.pricingCheck} aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 5.7L4.4 8L9 3.2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <div className={styles.pricingCtaWrap}>
        <ChamferedButton
          href={tier.ctaHref}
          variant={tier.featured ? 'primary' : 'secondary'}
          size="md"
          fullWidth
          showCornerTriangles={tier.featured}
        >
          GET STARTED
        </ChamferedButton>
      </div>
    </ChamferedPanel>
  );
}

export function PricingSection() {
  return (
    <SectionFrame id="pricing" bottomBorder>
      <div className={styles.sectionStack}>
        <SectionHeading
          badge={pricingContent.badge}
          titleWhite="BUILT FOR EVERY"
          titleOrange="PROJECT STAGE"
          description={pricingContent.description}
          align="split"
        />

        <div className={styles.pricingGrid}>
          {pricingContent.tiers.map((tier, idx) => (
            <PricingCard key={tier.id} tier={tier} index={idx} />
          ))}
        </div>

        <ChamferedPanel
          cornerCut={8}
          borderColor="rgba(255, 255, 255, 0.1)"
          backgroundColor="#090909"
          className={styles.assurancePanel}
          innerClassName={styles.assuranceGrid}
        >
          {pricingContent.assuranceStrip.map((item) => (
            <div key={item.id} className={styles.assuranceItem}>
              <span className={styles.assuranceDot} aria-hidden="true" />
              <div>
                <h4 className={styles.assuranceTitle}>{item.title}</h4>
                <p className={styles.assuranceSubtitle}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </ChamferedPanel>
      </div>
    </SectionFrame>
  );
}
