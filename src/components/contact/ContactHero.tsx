import { SectionHeading } from '@/components/primitives';
import { contactContent } from '@/content/contact';
import { ContactInfoCard } from './ContactInfoCard';
import { ContactStatus } from './ContactStatus';
import styles from './contact.module.css';

export function ContactHero() {
  return (
    <div className={styles.heroColumn}>
      <div className={styles.heroTop}>
        <SectionHeading
          badge={contactContent.badge}
          titleWhite="LET'S BUILD"
          titleOrange="SOMETHING"
          description={contactContent.description}
          align="left"
          as="h1"
          className={styles.heroHeading}
        />
      </div>

      <div className={styles.heroBottom}>
        <ContactStatus rows={contactContent.statusRows} />

        <div className={styles.infoGrid}>
          <ContactInfoCard
            icon="email"
            label={contactContent.emailLabel}
            value={contactContent.displayEmail.toUpperCase()}
            href={contactContent.mailtoHref}
          />
          <ContactInfoCard
            icon="location"
            label={contactContent.locationLabel}
            value={contactContent.locationText.toUpperCase()}
            href={contactContent.locationHref}
            external
          />
        </div>
      </div>
    </div>
  );
}
