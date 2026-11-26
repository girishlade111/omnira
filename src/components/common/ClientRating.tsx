import { ChamferedPanel } from '@/components/primitives';
import { testimonialsContent } from '@/content/testimonials';
import styles from './common.module.css';

export function ClientRating() {
  const { rating, ratingCaption, ratingSubcaption, controls } = testimonialsContent;

  return (
    <ChamferedPanel
      cornerCut={12}
      borderColor="rgba(255, 255, 255, 0.14)"
      backgroundColor="rgba(255, 255, 255, 0.02)"
      innerClassName={styles.ratingPanelInner}
    >
      <div className={styles.ratingTopRow}>
        <p className={styles.ratingCaption}>{ratingCaption}</p>
      </div>

      <div className={styles.ratingScoreRow}>
        <p className={styles.ratingValue}>{rating}</p>
        <div className={styles.ratingStars} aria-label="Rated 5 out of 5 stars">
          {[0, 1, 2, 3, 4].map((idx) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={idx}
              src={controls.ratingStarSvg}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <p className={styles.ratingSubcaption}>{ratingSubcaption}</p>
    </ChamferedPanel>
  );
}
