'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SectionFrame } from '@/components/layout';
import {
  ChamferedPanel,
  ExternalLinkIndicator,
  SectionHeading,
} from '@/components/primitives';
import { toolsContent } from '@/content/tools';
import styles from './about.module.css';

function resolveToolIconPath(rawRef: string): string {
  const filename = rawRef.split('/').pop() || '';
  return `/assets/icons/tools/${filename}`;
}

function CategoryIcon({ slug }: { slug: string }) {
  switch (slug) {
    case 'design':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9.8 2.2L11.8 4.2L5.2 10.8L2.5 11.5L3.2 8.8L9.8 2.2Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 'development':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 4.2L2.2 7L5 9.8M9 4.2L11.8 7L9 9.8" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 'motion':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4.2 3L10.8 7L4.2 11V3Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1.8L11.8 4.5V9.5L7 12.2L2.2 9.5V4.5L7 1.8Z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M7 7V12.2M7 7L11.8 4.5M7 7L2.2 4.5" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
  }
}

export function ToolsSelector() {
  const [activeSlug, setActiveSlug] = useState(toolsContent.categories[0].slug);

  const activeIndex = Math.max(
    0,
    toolsContent.categories.findIndex((c) => c.slug === activeSlug),
  );
  const currentCategory = toolsContent.categories[activeIndex] ?? toolsContent.categories[0];

  return (
    <SectionFrame id="system-stack" bottomBorder>
      <div className={styles.toolsSection}>
        <SectionHeading
          badge={toolsContent.badge}
          titleWhite="TOOLS BEHIND"
          titleOrange="THE EXECUTION"
          description={toolsContent.description}
          align="split"
        />

        <div className={styles.toolsGrid}>
          <div className={styles.toolsTabsCol} role="tablist" aria-label="Tool categories">
            {toolsContent.categories.map((cat) => {
              const isActive = cat.slug === currentCategory.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`${styles.toolsTabBtn} ${
                    isActive ? styles.toolsTabBtnActive : ''
                  }`.trim()}
                >
                  <span className={styles.toolsTabIcon}>
                    <CategoryIcon slug={cat.slug} />
                  </span>
                  <span>{cat.category}</span>
                </button>
              );
            })}
          </div>

          <ChamferedPanel
            cornerCut={10}
            borderColor="rgba(255, 255, 255, 0.14)"
            backgroundColor="#0c0c0c"
            showGrain
            grainOpacity={0.5}
            className={styles.toolsPanel}
            innerClassName={styles.toolsPanelInner}
          >
            <div className={styles.toolsPanelHeader}>
              <span className={styles.toolsPanelCategory}>{currentCategory.category}</span>
              <span className={styles.toolsPanelCount}>
                <span className={styles.toolsCountActive}>
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span className={styles.toolsCountTotal}>
                  {` / ${String(toolsContent.categories.length).padStart(2, '0')}`}
                </span>
              </span>
            </div>

            <div className={styles.toolCardsGrid} role="tabpanel">
              {currentCategory.tools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.toolCardLink}
                >
                  <ChamferedPanel
                    cornerCut={8}
                    borderColor="rgba(255, 255, 255, 0.1)"
                    hoverBorderColor="rgba(255, 152, 0, 0.5)"
                    backgroundColor="#101010"
                    className={styles.toolCardPanel}
                    innerClassName={styles.toolCardInner}
                  >
                    <div className={styles.toolCardTop}>
                      <span className={styles.toolIconBox}>
                        <Image
                          src={resolveToolIconPath(tool.iconInlineSvgRef)}
                          alt=""
                          width={16}
                          height={16}
                          unoptimized
                          aria-hidden="true"
                        />
                      </span>
                      <span className={styles.toolArrow} aria-hidden="true">
                        <ExternalLinkIndicator size={13} />
                      </span>
                    </div>

                    <div className={styles.toolMeta}>
                      <h3 className={styles.toolName}>{tool.name.toUpperCase()}</h3>
                      <p className={styles.toolDesc}>{tool.description}</p>
                    </div>
                  </ChamferedPanel>
                </a>
              ))}
            </div>
          </ChamferedPanel>
        </div>
      </div>
    </SectionFrame>
  );
}
