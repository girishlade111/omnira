import { OrangeText } from './OrangeText';
import { TechnicalBadge } from './TechnicalBadge';
import styles from './primitives.module.css';

export interface SectionHeadingProps {
  badge: string;
  titleWhite: string;
  titleOrange?: string;
  description?: string;
  align?: 'left' | 'split';
  showOrangeRule?: boolean;
  as?: 'h1' | 'h2';
  badgeVariant?: 'amber' | 'white';
  className?: string;
}

export function SectionHeading({
  badge,
  titleWhite,
  titleOrange,
  description,
  align = 'split',
  showOrangeRule = false,
  as: HeadingTag = 'h2',
  badgeVariant = 'amber',
  className = '',
}: SectionHeadingProps) {
  const isSplit = align === 'split' && Boolean(description);

  return (
    <div className={`${styles.sectionHeadingRoot} ${className}`.trim()}>
      <TechnicalBadge label={badge} variant={badgeVariant} />

      <div
        className={`${styles.sectionHeadingRow} ${isSplit ? styles.sectionHeadingSplit : ''}`.trim()}
      >
        <div className={styles.sectionHeadingTitleGroup}>
          <HeadingTag
            className={`${styles.sectionHeadingTitle} ${
              HeadingTag === 'h1' ? styles.sectionHeadingTitleH1 : ''
            }`.trim()}
          >
            <span>{titleWhite}</span>
            {titleOrange ? (
              <>
                {' '}
                <OrangeText>{titleOrange}</OrangeText>
              </>
            ) : null}
          </HeadingTag>
          {showOrangeRule ? (
            <div className={styles.sectionHeadingOrangeRule} aria-hidden="true" />
          ) : null}
        </div>

        {description ? <p className={styles.sectionHeadingDescription}>{description}</p> : null}
      </div>
    </div>
  );
}
