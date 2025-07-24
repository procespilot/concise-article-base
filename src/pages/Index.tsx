
import { useState, useRef, useEffect, Suspense } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ArticleListPage from "@/pages/ArticleListPage";
import Categories from "@/components/Categories";
import ConsolidatedAuthPage from "@/components/ConsolidatedAuthPage";
import UserForm from "@/components/UserForm";
import CategoryForm from "@/components/CategoryForm";
import UserRoleDebug from "@/components/UserRoleDebug";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/contexts/UserContext";
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts";
import { 
  LazyAnalytics, 
  LazyArticleDetail, 
  LazyArticleEditor, 
  LazyUsers, 
  LazySettings,
  ComponentLoader 
} from "@/components/LazyComponents";
import InformativeHomepage from "@/components/InformativeHomepage";

const Index = () => {
  const {
    isAuthenticated,
    isManager,
    loading: authLoading
  } = useAuth();
  const userData = useUser();
  const [activeSection, setActiveSection] = useState(isManager ? "dashboard" : "articles");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Listen for settings navigation from header
  useEffect(() => {
    const handleSettingsNavigation = () => {
      handleSectionChange('settings');
    };

    window.addEventListener('navigate-to-settings', handleSettingsNavigation);
    return () => {
      window.removeEventListener('navigate-to-settings', handleSettingsNavigation);
    };
  }, []);

  if (authLoading || userData.loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" text="Applicatie laden..." />
      </div>;
  }

  if (!isAuthenticated) {
    return <ConsolidatedAuthPage />;
  }

  const handleArticleClick = (articleId: string) => {
    console.log("Article clicked:", articleId);
    setSelectedArticleId(articleId);
    setEditingArticleId(null);
    setIsCreatingArticle(false);
    userData.incrementViews(articleId);
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
      success = await userData.createArticle(articleData);
    } else if (editingArticleId) {
      success = await userData.updateArticle(editingArticleId, articleData);
    }
    if (success) {
      handleBackToList();
      await userData.refetchArticles();
    }
  };

  const handleSectionChange = (section: string) => {
    console.log("Section change:", section);
    setActiveSection(section);
    setSelectedArticleId(null);
    setEditingArticleId(null);
    setIsCreatingArticle(false);
  };

  const handleRefreshCategories = async () => {
    await userData.refetchCategories();
  };

  const handleRefreshUsers = async () => {
    await userData.refetchUsers();
  };

  const handleCreateCategory = () => {
    setShowCategoryForm(true);
  };

  const handleManageUsers = () => {
    setActiveSection("users");
  };

  const handleShowUserForm = () => {
    setShowUserForm(true);
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    if (activeSection === "dashboard") {
      breadcrumbs.push({
        label: "Dashboard",
        isActive: true
      });
    } else if (activeSection === "articles") {
      breadcrumbs.push({
        label: "Artikelen",
        onClick: () => handleBackToList(),
        isActive: !selectedArticleId && !editingArticleId && !isCreatingArticle
      });
      if (selectedArticleId) {
        const article = userData.articles.find(a => a.id === selectedArticleId);
        breadcrumbs.push({
          label: article?.title || "Artikel",
          isActive: true
        });
      } else if (editingArticleId) {
        const article = userData.articles.find(a => a.id === editingArticleId);
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
      breadcrumbs.push({
        label: sectionNames[activeSection] || activeSection,
        isActive: true
      });
    }
    return breadcrumbs;
  };

  const renderContent = () => {
    // Add debug section for troubleshooting
    if (activeSection === "debug") {
      return <UserRoleDebug />;
    }

    if (isCreatingArticle || editingArticleId) {
      return (
        <Suspense fallback={<ComponentLoader />}>
          <LazyArticleEditor 
            articleId={editingArticleId || undefined} 
            onBack={handleBackToList} 
            onSave={handleSaveArticle} 
            articles={userData.articles} 
            categories={userData.categories} 
          />
        </Suspense>
      );
    }

    if (selectedArticleId) {
      const article = userData.articles.find(a => a.id === selectedArticleId);
      if (!article) {
        return <div className="text-center py-12 bg-white">
            <p className="text-gray-600">Artikel niet gevonden</p>
          </div>;
      }
      return (
        <Suspense fallback={<ComponentLoader />}>
          <LazyArticleDetail 
            article={article} 
            onBack={handleBackToList} 
            onEdit={isManager ? () => handleEditArticle(selectedArticleId) : undefined} 
          />
        </Suspense>
      );
    }

    switch (activeSection) {
      case "dashboard":
        return isManager ? 
          <InformativeHomepage 
            articles={userData.articles}
            onCreateArticle={handleCreateArticle}
            onArticleClick={handleArticleClick}
            isManager={isManager}
          /> : 
          <InformativeHomepage 
            articles={userData.articles}
            onCreateArticle={handleCreateArticle}
            onArticleClick={handleArticleClick}
            isManager={isManager}
          />;
      case "articles":
        return <ArticleListPage 
          articles={userData.articles} 
          categories={userData.categories} 
          onArticleClick={handleArticleClick} 
          onCreateArticle={handleCreateArticle} 
          isManager={isManager} 
        />;
      case "analytics":
        return isManager ? (
          <Suspense fallback={<ComponentLoader />}>
            <LazyAnalytics 
              articles={userData.articles} 
              categories={userData.categories} 
            />
          </Suspense>
        ) : (
          <ArticleListPage 
            articles={userData.articles} 
            categories={userData.categories} 
            onArticleClick={handleArticleClick} 
            onCreateArticle={handleCreateArticle} 
            isManager={isManager} 
          />
        );
      case "categories":
        return <Categories 
          categories={userData.categories} 
          articles={userData.articles} 
          onRefresh={handleRefreshCategories}
          onCreateCategory={handleCreateCategory}
        />;
      case "users":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <LazyUsers 
              users={userData.users} 
              onRefresh={handleRefreshUsers}
              onCreateUser={handleShowUserForm}
            />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <LazySettings />
          </Suspense>
        );
      default:
        return <InformativeHomepage 
          articles={userData.articles}
          onCreateArticle={handleCreateArticle}
          onArticleClick={handleArticleClick}
          isManager={isManager}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-white">
          <AppSidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange} 
            onCreateArticle={handleCreateArticle} 
          />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <Header />
              </div>
              {/* Temporary debug button*/}
              <button 
                onClick={() => handleSectionChange("debug")} 
                className="text-xs bg-red-100 px-2 py-1 rounded"
              >
                DEBUG
              </button>
            </header>
            <main className="flex-1 p-8 overflow-y-auto bg-white">
              <Breadcrumbs items={getBreadcrumbs()} />
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Modals */}
      <UserForm
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        onUserAdded={handleRefreshUsers}
      />
      
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        onCategoryAdded={handleRefreshCategories}
      />
    </div>
  );
};

export default Index;
