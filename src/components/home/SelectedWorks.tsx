import { ProjectCard } from '@/components/common';
import { SectionFrame } from '@/components/layout';
import { ChamferedButton, SectionHeading } from '@/components/primitives';
import { selectedWorkCopy, selectedWorkProjects } from '@/content/projects';
import styles from './home.module.css';

export function SelectedWorks() {
  return (
    <SectionFrame id="selected-work" bottomBorder>
      <div className={styles.sectionStack}>
        <SectionHeading
          badge={selectedWorkCopy.badge}
          titleWhite="CRAFTED DIGITAL"
          titleOrange="EXPERIENCES"
          description={selectedWorkCopy.description}
          align="split"
        />

        <div className={styles.selectedGrid}>
          {selectedWorkProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              featured
              priority={idx < 3}
            />
          ))}
        </div>

        <div className={styles.selectedFooterRow}>
          <ChamferedButton
            href={selectedWorkCopy.viewAllHref}
            variant="outline"
            size="md"
            showArrow
          >
            {selectedWorkCopy.viewAllLabel}
          </ChamferedButton>
        </div>
      </div>
    </SectionFrame>
  );
}
