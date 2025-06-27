
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ArticlesList from "@/components/ArticlesList";
import Analytics from "@/components/Analytics";
import { UserProvider, useUser } from "@/contexts/UserContext";

const IndexContent = () => {
  const { isManager } = useUser();
  const [activeSection, setActiveSection] = useState(isManager ? "dashboard" : "articles");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return isManager ? <Dashboard /> : <ArticlesList />;
      case "articles":
        return <ArticlesList />;
      case "analytics":
        return isManager ? <Analytics /> : <ArticlesList />;
      case "categories":
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Categorieën</h1>
            <p className="text-gray-600">
              {isManager 
                ? "Beheer je knowledge base categorieën en structuur" 
                : "Blader door artikelen per categorie"
              }
            </p>
          </div>
        );
      case "users":
        return isManager ? (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gebruikers</h1>
            <p className="text-gray-600">Beheer gebruikerstoegang en rollen</p>
          </div>
        ) : (
          <ArticlesList />
        );
      case "settings":
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Instellingen</h1>
            <p className="text-gray-600">
              {isManager 
                ? "Configureer je ClearBase omgeving" 
                : "Beheer je persoonlijke instellingen"
              }
            </p>
          </div>
        );
      default:
        return isManager ? <Dashboard /> : <ArticlesList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <UserProvider>
      <IndexContent />
    </UserProvider>
  );
};

export default Index;
