'use client';
import { useState, useEffect, RefObject } from 'react';

/**
 * Computes the fixed layout for elements that should span
 * from the sidebar's right edge to the viewport's right edge on desktop,
 * or full viewport width on mobile.
 *
 * Mirrors the approach used in SelectionStatusBar and ProgressTabs.
 * Returns { top, left, width } for use as inline style on a fixed element.
 */
export interface SidebarFixedLayout {
  top: number;
  left: number | string;
  width: number | string;
}

export function useSidebarFixedLayout(): SidebarFixedLayout {
  const [layout, setLayout] = useState<SidebarFixedLayout>({
    top: 0,
    left: 0,
    width: '100%',
  });

  useEffect(() => {
    const updateLayout = () => {
      const sidebar = document.getElementById('main-sidebar');
      const viewportWidth = window.innerWidth;

      if (viewportWidth >= 1024 && sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        setLayout({
          top: 0,
          left: sidebarRect.right,
          width: viewportWidth - sidebarRect.right,
        });
      } else {
        setLayout({ top: 0, left: 0, width: '100%' });
      }
    };

    updateLayout();

    const sidebar = document.getElementById('main-sidebar');
    let observer: ResizeObserver | null = null;

    if (sidebar) {
      observer = new ResizeObserver(updateLayout);
      observer.observe(sidebar);
    }

    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      if (observer) observer.disconnect();
    };
  }, []);

  return layout;
}

/**
 * Computes the margin-left and width override needed for a sticky full-bleed
 * element to escape its parent container and span from the sidebar's right
 * edge (desktop) or viewport left (mobile) to the viewport right edge.
 *
 * Pass a ref to the element whose natural left position we should measure.
 */
export interface SidebarStickyLayout {
  /** Negative margin to apply to margin-left so the element reaches its target left edge */
  marginLeft: number;
  /** Width the element should use to span to viewport right */
  width: number;
}

export function useSidebarStickyLayout(
  ref: RefObject<HTMLElement | null>,
): SidebarStickyLayout {
  const [layout, setLayout] = useState<SidebarStickyLayout>({
    marginLeft: 0,
    width: 0,
  });

  useEffect(() => {
    const updateLayout = () => {
      const sidebar = document.getElementById('main-sidebar');
      const el = ref.current;
      const viewportWidth = window.innerWidth;

      if (!el) return;

      // Temporarily remove any previously-set margin so we measure natural position
      const prevMargin = el.style.marginLeft;
      el.style.marginLeft = '0px';
      const rect = el.getBoundingClientRect();
      el.style.marginLeft = prevMargin;

      const naturalLeft = rect.left;

      if (viewportWidth >= 1024 && sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const targetLeft = sidebarRect.right;
        setLayout({
          marginLeft: targetLeft - naturalLeft,
          width: viewportWidth - targetLeft,
        });
      } else {
        setLayout({
          marginLeft: -naturalLeft,
          width: viewportWidth,
        });
      }
    };

    updateLayout();

    const sidebar = document.getElementById('main-sidebar');
    let sidebarObserver: ResizeObserver | null = null;
    let elObserver: ResizeObserver | null = null;
    const el = ref.current;

    if (sidebar) {
      sidebarObserver = new ResizeObserver(updateLayout);
      sidebarObserver.observe(sidebar);
    }
    if (el) {
      elObserver = new ResizeObserver(updateLayout);
      elObserver.observe(el);
    }

    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      if (sidebarObserver) sidebarObserver.disconnect();
      if (elObserver) elObserver.disconnect();
    };
  }, [ref]);

  return layout;
}
