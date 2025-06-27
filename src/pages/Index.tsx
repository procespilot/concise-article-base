
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ArticlesList from "@/components/ArticlesList";
import ArticleDetail from "@/components/ArticleDetail";
import Analytics from "@/components/Analytics";
import LoginPage from "@/components/LoginPage";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const IndexContent = () => {
  const { isAuthenticated, isManager } = useAuth();
  const [activeSection, setActiveSection] = useState(isManager ? "dashboard" : "articles");
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleArticleClick = (articleId: number) => {
    setSelectedArticleId(articleId);
  };

  const handleBackToList = () => {
    setSelectedArticleId(null);
  };

  const handleCreateArticle = () => {
    // TODO: Implement article creation
    console.log("Create new article");
  };

  const renderContent = () => {
    // If viewing an article detail
    if (selectedArticleId) {
      return (
        <ArticleDetail 
          articleId={selectedArticleId} 
          onBack={handleBackToList}
        />
      );
    }

    switch (activeSection) {
      case "dashboard":
        return isManager ? <Dashboard /> : (
          <ArticlesList 
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
          />
        );
      case "articles":
        return (
          <ArticlesList 
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
          />
        );
      case "analytics":
        return isManager ? <Analytics /> : (
          <ArticlesList 
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
          />
        );
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
          <ArticlesList 
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
          />
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
        return isManager ? <Dashboard /> : (
          <ArticlesList 
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header />
            </div>
          </header>
          <main className="flex-1 p-8 overflow-y-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <IndexContent />
      </UserProvider>
    </AuthProvider>
  );
};

export default Index;
