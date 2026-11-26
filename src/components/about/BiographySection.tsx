import { SectionFrame } from '@/components/layout';
import { ChamferedPanel, SectionHeading } from '@/components/primitives';
import { profileContent } from '@/content/profile';
import { ProfileDetails } from './ProfileDetails';
import styles from './about.module.css';

export function BiographySection() {
  return (
    <SectionFrame id="biography" bottomBorder>
      <div className={styles.bioGrid}>
        <div className={styles.bioLeft}>
          <SectionHeading
            badge={profileContent.aboutBadge}
            titleWhite="BEHIND OMNIRA. THIS IS"
            titleOrange="WHO I AM"
            align="left"
            showOrangeRule
          />

          <div className={styles.bioParagraphs}>
            {profileContent.biographyParagraphs.map((para, idx) => (
              <p key={idx} className={styles.bioText}>
                {para}
              </p>
            ))}
          </div>

          <div className={styles.signatureWrap}>
            <img
              src={profileContent.signatureSvgPath}
              alt={`${profileContent.details[0]?.value ?? 'Adrian Voss'} signature`}
              width={95}
              height={29}
              className={styles.signatureImg}
            />
          </div>
        </div>

        <ChamferedPanel
          cornerCut={10}
          borderColor="rgba(255, 255, 255, 0.14)"
          backgroundColor="#0d0d0d"
          showGrain
          grainOpacity={0.55}
          className={styles.profilePanel}
          innerClassName={styles.profilePanelInner}
        >
          <ProfileDetails details={profileContent.details} />
        </ChamferedPanel>
      </div>
    </SectionFrame>
  );
}
