
import React from 'react';
import WelcomeSection from './WelcomeSection';
import DailyOverviewCards from './DailyOverviewCards';
import InformativeWidgets from './InformativeWidgets';

interface InformativeHomepageProps {
  articles: any[];
  onCreateArticle?: () => void;
  onArticleClick?: (id: string) => void;
  isManager?: boolean;
}

const InformativeHomepage = ({ 
  articles, 
  onCreateArticle, 
  onArticleClick, 
  isManager 
}: InformativeHomepageProps) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section with Time & Date */}
      <WelcomeSection />
      
      {/* Daily Overview Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Dagelijks Overzicht
        </h2>
        <DailyOverviewCards 
          articles={articles}
          onCreateArticle={onCreateArticle}
          onArticleClick={onArticleClick}
          isManager={isManager}
        />
      </div>
      
      {/* Informative Widgets */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Informatieve Widgets
        </h2>
        <InformativeWidgets />
      </div>
    </div>
  );
};

export default InformativeHomepage;
