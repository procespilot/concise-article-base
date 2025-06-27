
import { lazy } from 'react';

// Lazy load heavy components
export const LazyAnalytics = lazy(() => import('./Analytics'));
export const LazyArticleDetail = lazy(() => import('./ArticleDetail'));
export const LazyArticleEditor = lazy(() => import('./ArticleEditor'));
export const LazyUsers = lazy(() => import('./Users'));
export const LazySettings = lazy(() => import('./Settings'));

// Loading fallback component
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clearbase-600"></div>
    <span className="ml-2 text-gray-600">Laden...</span>
  </div>
);
