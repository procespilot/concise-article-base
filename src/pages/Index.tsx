
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ArticlesList from "@/components/ArticlesList";
import Analytics from "@/components/Analytics";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "articles":
        return <ArticlesList />;
      case "analytics":
        return <Analytics />;
      case "categories":
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Categorieën</h1>
            <p className="text-gray-600">Beheer je knowledge base categorieën en structuur</p>
          </div>
        );
      case "users":
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gebruikers</h1>
            <p className="text-gray-600">Beheer gebruikerstoegang en rollen</p>
          </div>
        );
      case "settings":
        return (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Instellingen</h1>
            <p className="text-gray-600">Configureer je ClearBase omgeving</p>
          </div>
        );
      default:
        return <Dashboard />;
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

export default Index;
