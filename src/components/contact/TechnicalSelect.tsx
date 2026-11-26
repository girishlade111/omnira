'use client';

import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ContactSelectOption } from '@/types';
import styles from './contact.module.css';

export interface TechnicalSelectProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: ContactSelectOption[];
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

export function TechnicalSelect({
  id,
  label,
  placeholder,
  value,
  options,
  required = false,
  error,
  onChange,
}: TechnicalSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeaheadRef = useRef('');
  const typeaheadTimerRef = useRef<number | null>(null);
  const listboxId = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  const commitSelection = useCallback(
    (index: number) => {
      const opt = options[index];
      if (!opt) return;
      onChange(opt.value);
      setActiveIndex(index);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange, options],
  );

  const openMenu = useCallback(() => {
    const currentIdx = options.findIndex((o) => o.value === value);
    setActiveIndex(currentIdx >= 0 ? currentIdx : 0);
    setOpen(true);
  }, [options, value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setActiveIndex((prev) => (prev + 1) % options.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
      }
      return;
    }

    if (event.key === 'Home') {
      if (open) {
        event.preventDefault();
        setActiveIndex(0);
      }
      return;
    }

    if (event.key === 'End') {
      if (open) {
        event.preventDefault();
        setActiveIndex(Math.max(0, options.length - 1));
      }
      return;
    }

    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else {
        commitSelection(activeIndex);
      }
      return;
    }

    if (event.key === 'Tab') {
      if (open) setOpen(false);
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeaheadRef.current += event.key.toLowerCase();
      if (typeaheadTimerRef.current) {
        window.clearTimeout(typeaheadTimerRef.current);
      }
      typeaheadTimerRef.current = window.setTimeout(() => {
        typeaheadRef.current = '';
      }, 600);

      const query = typeaheadRef.current;
      const matchIdx = options.findIndex((o) => o.label.toLowerCase().startsWith(query));
      if (matchIdx >= 0) {
        if (!open) {
          onChange(options[matchIdx].value);
        }
        setActiveIndex(matchIdx);
      }
    }
  };

  const activeOptionId = open && options[activeIndex] ? `${listboxId}-opt-${activeIndex}` : undefined;

  return (
    <div className={styles.fieldGroup} ref={containerRef}>
      <label id={labelId} htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>

      <div className={styles.selectWrap}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-labelledby={`${labelId} ${id}`}
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-activedescendant={activeOptionId}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`${styles.selectTrigger} ${!selectedOption ? styles.selectPlaceholder : ''} ${
            open ? styles.selectTriggerOpen : ''
          } ${error ? styles.inputError : ''}`.trim()}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.selectValueText}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span
            className={`${styles.selectChevron} ${open ? styles.selectChevronOpen : ''}`}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>
          </span>
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className={styles.selectMenu}
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isFocused = idx === activeIndex;
              return (
                <li
                  key={opt.value}
                  id={`${listboxId}-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.selectOption} ${
                    isSelected ? styles.selectOptionSelected : ''
                  } ${isFocused ? styles.selectOptionFocused : ''}`.trim()}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitSelection(idx);
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected ? <span className={styles.selectCheck} aria-hidden="true">OK</span> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className={styles.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
