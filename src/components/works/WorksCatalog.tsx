'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { ProjectCard } from '@/components/common';
import { SectionHeading } from '@/components/primitives';
import {
  projectCategoryFilters,
  projects,
  worksPageCopy,
} from '@/content/projects';
import type { ProjectCategoryLabel } from '@/types';
import { WorksFilterBar } from './WorksFilterBar';
import styles from './works.module.css';

function resolveCategoryFromParam(param: string | null): ProjectCategoryLabel {
  if (!param) return 'ALL PROJECTS';
  const match = projectCategoryFilters.find(
    (f) => f.slug.toLowerCase() === param.toLowerCase(),
  );
  return match ? match.label : 'ALL PROJECTS';
}

export function WorksCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = useMemo(
    () => resolveCategoryFromParam(searchParams.get('category')),
    [searchParams],
  );

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'ALL PROJECTS') {
      return projects;
    }
    return projects.filter((p) => p.categories.includes(activeCategory));
  }, [activeCategory]);

  const handleSelectCategory = useCallback(
    (label: ProjectCategoryLabel) => {
      const target = projectCategoryFilters.find((f) => f.label === label);
      const nextParams = new URLSearchParams(searchParams.toString());
      if (!target || target.slug === 'all') {
        nextParams.delete('category');
      } else {
        nextParams.set('category', target.slug);
      }
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className={styles.catalogRoot}>
      <SectionHeading
        badge={worksPageCopy.badge}
        titleWhite="CRAFTED DIGITAL"
        titleOrange="EXPERIENCES"
        description={worksPageCopy.description}
        align="split"
        as="h1"
      />

      <div className={styles.controlsRow}>
        <WorksFilterBar
          filters={projectCategoryFilters}
          activeCategory={activeCategory}
          onSelect={handleSelectCategory}
        />
        <p className={styles.countMeta} aria-live="polite">
          {`${filteredProjects.length} ${filteredProjects.length === 1 ? 'PROJECT' : 'PROJECTS'}`}
        </p>
      </div>

      <div className={styles.projectsGrid} role="region" aria-label="Portfolio projects">
        {filteredProjects.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            featured={project.featured.inHomeSelectedWork}
            priority={idx < 6}
          />
        ))}
      </div>
    </div>
  );
}
