import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ArticleListSkeletonProps {
  count?: number;
  variant?: 'grid' | 'list' | 'compact';
}

const ArticleListSkeleton = ({ 
  count = 6, 
  variant = 'grid' 
}: ArticleListSkeletonProps) => {
  
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
        
        <div className="pt-2 border-t border-border">
          <Skeleton className="h-5 w-24" />
        </div>
        
        {/* AI Hints skeleton */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonCompact = () => (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonList = () => (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeletons = () => {
    return Array.from({ length: count }, (_, index) => {
      switch (variant) {
        case 'compact':
          return <SkeletonCompact key={index} />;
        case 'list':
          return <SkeletonList key={index} />;
        default:
          return <SkeletonCard key={index} />;
      }
    });
  };

  if (variant === 'compact' || variant === 'list') {
    return (
      <div className="space-y-4" role="status" aria-label="Artikelen laden...">
        {renderSkeletons()}
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
      role="status" 
      aria-label="Artikelen laden..."
    >
      {renderSkeletons()}
    </div>
  );
};

export default ArticleListSkeleton;