
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ArticlesList from "@/components/ArticlesList";
import ArticleDetail from "@/components/ArticleDetail";
import ArticleEditor from "@/components/ArticleEditor";
import Analytics from "@/components/Analytics";
import Categories from "@/components/Categories";
import Users from "@/components/Users";
import Settings from "@/components/Settings";
import LoginPage from "@/components/LoginPage";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const IndexContent = () => {
  const { isAuthenticated, isManager } = useAuth();
  const [activeSection, setActiveSection] = useState(isManager ? "dashboard" : "articles");
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleArticleClick = (articleId: number) => {
    console.log("Article clicked:", articleId);
    setSelectedArticleId(articleId);
    setEditingArticleId(null);
    setIsCreatingArticle(false);
  };

  const handleBackToList = () => {
    console.log("Back to list");
    setSelectedArticleId(null);
    setEditingArticleId(null);
    setIsCreatingArticle(false);
  };

  const handleCreateArticle = () => {
    console.log("Handle create article");
    setIsCreatingArticle(true);
    setSelectedArticleId(null);
    setEditingArticleId(null);
    setActiveSection("articles");
  };

  const handleEditArticle = (articleId: number) => {
    console.log("Edit article:", articleId);
    setEditingArticleId(articleId);
    setSelectedArticleId(null);
    setIsCreatingArticle(false);
  };

  const handleSaveArticle = () => {
    console.log("Save article");
    handleBackToList();
  };

  const handleSectionChange = (section: string) => {
    console.log("Section change:", section);
    setActiveSection(section);
    setSelectedArticleId(null);
    setEditingArticleId(null);
    setIsCreatingArticle(false);
  };

  const renderContent = () => {
    // If creating or editing an article
    if (isCreatingArticle || editingArticleId) {
      return (
        <ArticleEditor
          articleId={editingArticleId || undefined}
          onBack={handleBackToList}
          onSave={handleSaveArticle}
        />
      );
    }

    // If viewing an article detail
    if (selectedArticleId) {
      return (
        <ArticleDetail 
          articleId={selectedArticleId} 
          onBack={handleBackToList}
          onEdit={isManager ? () => handleEditArticle(selectedArticleId) : undefined}
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
        return <Categories />;
      case "users":
        return <Users />;
      case "settings":
        return <Settings />;
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
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
          onCreateArticle={handleCreateArticle}
        />
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
