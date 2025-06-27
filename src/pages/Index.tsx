
import { useState, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ArticlesList from "@/components/ArticlesList";
import ArticleDetail from "@/components/ArticleDetail";
import ArticleEditor from "@/components/ArticleEditor";
import Analytics from "@/components/Analytics";
import Categories from "@/components/Categories";
import Users from "@/components/Users";
import Settings from "@/components/Settings";
import AuthPage from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts";

const Index = () => {
  const { isAuthenticated, isManager, loading: authLoading } = useAuth();
  const supabaseData = useSupabaseData();
  
  const [activeSection, setActiveSection] = useState(isManager ? "dashboard" : "articles");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useCommonShortcuts({
    onSearch: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    onNew: () => {
      if (isManager) {
        handleCreateArticle();
      }
    },
    onEscape: () => {
      if (selectedArticleId || editingArticleId || isCreatingArticle) {
        handleBackToList();
      }
    }
  });

  if (authLoading || supabaseData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Applicatie laden..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleArticleClick = (articleId: string) => {
    console.log("Article clicked:", articleId);
    setSelectedArticleId(articleId);
    setEditingArticleId(null);
    setIsCreatingArticle(false);
    supabaseData.incrementViews(articleId);
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

  const handleEditArticle = (articleId: string) => {
    console.log("Edit article:", articleId);
    setEditingArticleId(articleId);
    setSelectedArticleId(null);
    setIsCreatingArticle(false);
  };

  const handleSaveArticle = async (articleData: any) => {
    console.log("Save article", articleData);
    let success = false;
    
    if (isCreatingArticle) {
      success = await supabaseData.createArticle(articleData);
    } else if (editingArticleId) {
      success = await supabaseData.updateArticle(editingArticleId, articleData);
    }
    
    if (success) {
      handleBackToList();
    }
  };

  const handleSectionChange = (section: string) => {
    console.log("Section change:", section);
    setActiveSection(section);
    setSelectedArticleId(null);
    setEditingArticleId(null);
    setIsCreatingArticle(false);
  };

  // Breadcrumb logic
  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    
    if (activeSection === "dashboard") {
      breadcrumbs.push({ label: "Dashboard", isActive: true });
    } else if (activeSection === "articles") {
      breadcrumbs.push({ 
        label: "Artikelen", 
        onClick: () => handleBackToList(),
        isActive: !selectedArticleId && !editingArticleId && !isCreatingArticle
      });
      
      if (selectedArticleId) {
        const article = supabaseData.articles.find(a => a.id === selectedArticleId);
        breadcrumbs.push({ 
          label: article?.title || "Artikel", 
          isActive: true 
        });
      } else if (editingArticleId) {
        const article = supabaseData.articles.find(a => a.id === editingArticleId);
        breadcrumbs.push({ 
          label: `${article?.title || "Artikel"} bewerken`, 
          isActive: true 
        });
      } else if (isCreatingArticle) {
        breadcrumbs.push({ 
          label: "Nieuw artikel", 
          isActive: true 
        });
      }
    } else {
      const sectionNames: Record<string, string> = {
        analytics: "Analytics",
        categories: "Categorieën",
        users: "Gebruikers",
        settings: "Instellingen"
      };
      breadcrumbs.push({ label: sectionNames[activeSection] || activeSection, isActive: true });
    }
    
    return breadcrumbs;
  };

  const renderContent = () => {
    // If creating or editing an article
    if (isCreatingArticle || editingArticleId) {
      return (
        <ArticleEditor
          articleId={editingArticleId || undefined}
          onBack={handleBackToList}
          onSave={handleSaveArticle}
          articles={supabaseData.articles}
          categories={supabaseData.categories}
        />
      );
    }

    // If viewing an article detail
    if (selectedArticleId) {
      const article = supabaseData.articles.find(a => a.id === selectedArticleId);
      if (!article) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Artikel niet gevonden</p>
          </div>
        );
      }
      
      return (
        <ArticleDetail 
          article={article}
          onBack={handleBackToList}
          onEdit={isManager ? () => handleEditArticle(selectedArticleId) : undefined}
        />
      );
    }

    switch (activeSection) {
      case "dashboard":
        return isManager ? (
          <Dashboard 
            articles={supabaseData.articles}
            categories={supabaseData.categories}
            users={supabaseData.users}
          />
        ) : (
          <ArticlesList 
            articles={supabaseData.articles}
            categories={supabaseData.categories}
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
            isManager={isManager}
            searchInputRef={searchInputRef}
          />
        );
      case "articles":
        return (
          <ArticlesList 
            articles={supabaseData.articles}
            categories={supabaseData.categories}
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
            isManager={isManager}
            searchInputRef={searchInputRef}
          />
        );
      case "analytics":
        return isManager ? (
          <Analytics 
            articles={supabaseData.articles}
            categories={supabaseData.categories}
          />
        ) : (
          <ArticlesList 
            articles={supabaseData.articles}
            categories={supabaseData.categories}
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
            isManager={isManager}
            searchInputRef={searchInputRef}
          />
        );
      case "categories":
        return (
          <Categories 
            categories={supabaseData.categories}
            articles={supabaseData.articles}
            onRefresh={supabaseData.refetchCategories}
          />
        );
      case "users":
        return (
          <Users 
            users={supabaseData.users}
            onRefresh={supabaseData.refetchUsers}
          />
        );
      case "settings":
        return <Settings />;
      default:
        return isManager ? (
          <Dashboard 
            articles={supabaseData.articles}
            categories={supabaseData.categories}
            users={supabaseData.users}
          />
        ) : (
          <ArticlesList 
            articles={supabaseData.articles}
            categories={supabaseData.categories}
            onArticleClick={handleArticleClick}
            onCreateArticle={handleCreateArticle}
            isManager={isManager}
            searchInputRef={searchInputRef}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
            onCreateArticle={handleCreateArticle}
          />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-4 bg-white dark:bg-gray-800">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <Header />
              </div>
            </header>
            <main className="flex-1 p-8 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <Breadcrumbs items={getBreadcrumbs()} />
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
