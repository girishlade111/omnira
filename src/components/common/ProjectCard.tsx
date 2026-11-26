import { ChamferedPanel, ExternalLinkIndicator } from '@/components/primitives';
import type { Project } from '@/types';
import styles from './common.module.css';

export interface ProjectCardProps {
  project: Project;
  featured?: boolean;
  priority?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  featured = false,
  priority = false,
  className,
}: ProjectCardProps) {
  const { thumbnailVariants } = project;

  return (
    <a
      href={project.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? `${styles.projectCardLink} ${className}` : styles.projectCardLink}
    >
      <ChamferedPanel
        cornerCut={featured ? 11 : 8}
        borderColor="rgba(255, 255, 255, 0.14)"
        hoverBorderColor="#ff9800"
        backgroundColor="rgba(255, 255, 255, 0.02)"
        className={styles.projectCardPanel}
        innerClassName={styles.projectCardInner}
      >
        <div className={styles.projectMediaWrap}>
          <picture className={styles.projectPicture}>
            <source type="image/avif" srcSet={thumbnailVariants.avif} />
            <source type="image/webp" srcSet={thumbnailVariants.webp} />
            <img
              src={thumbnailVariants.fallback}
              alt={project.imageAlt}
              width={thumbnailVariants.width}
              height={thumbnailVariants.height}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={styles.projectImg}
            />
          </picture>
        </div>

        <div className={styles.projectMetaRow}>
          <div className={styles.projectTextStack}>
            <h3 className={styles.projectTitle}>{project.name}</h3>
            <p className={styles.projectDomain}>{project.displayDomain}</p>
            <span className="sr-only"> (opens external showcase in new tab)</span>
          </div>
          <span className={styles.projectArrowWrap} aria-hidden="true">
            <ExternalLinkIndicator size={16} />
          </span>
        </div>
      </ChamferedPanel>
    </a>
  );
}
