'use client';

import type { ProjectCategoryFilter, ProjectCategoryLabel } from '@/types';
import styles from './works.module.css';

export interface WorksFilterBarProps {
  filters: ProjectCategoryFilter[];
  activeCategory: ProjectCategoryLabel;
  onSelect: (category: ProjectCategoryLabel) => void;
}

export function WorksFilterBar({
  filters,
  activeCategory,
  onSelect,
}: WorksFilterBarProps) {
  return (
    <div className={styles.filterBar} role="tablist" aria-label="Filter projects by category">
      {filters.map((filter) => {
        const isActive = filter.label === activeCategory;
        return (
          <button
            key={filter.slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`.trim()}
            onClick={() => onSelect(filter.label)}
          >
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
