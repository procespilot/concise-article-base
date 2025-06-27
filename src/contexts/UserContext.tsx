
import React, { createContext, useContext, useState } from 'react';

type UserRole = 'user' | 'manager';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  updatedAt: string;
  views: number;
  status: 'Gepubliceerd' | 'Concept' | 'Gearchiveerd';
  featured: boolean;
  keywords: string[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isManager: boolean;
  articles: Article[];
  categories: string[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Jan Doe',
    email: 'jan.doe@example.com',
    role: 'user' // Change this to 'manager' to test manager view
  });

  const isManager = user?.role === 'manager';

  const articles: Article[] = [
    {
      id: 1,
      title: "Hoe maak ik een account aan?",
      excerpt: "Stap-voor-stap uitleg over het aanmaken van een nieuw account in ClearBase...",
      content: "Gedetailleerde uitleg over het registratieproces...",
      category: "Aan de slag",
      author: "Sarah van Dam",
      updatedAt: "2024-01-15",
      views: 245,
      status: "Gepubliceerd",
      featured: true,
      keywords: ["account", "registratie", "aanmelden", "nieuw", "gebruiker", "inloggen"]
    },
    {
      id: 2,
      title: "Wachtwoord vergeten - wat nu?",
      excerpt: "Instructies voor het resetten van je wachtwoord wanneer je deze bent vergeten...",
      content: "Stappen om je wachtwoord te herstellen...",
      category: "Account beheer",
      author: "Mike de Jong",
      updatedAt: "2024-01-14",
      views: 189,
      status: "Gepubliceerd",
      featured: false,
      keywords: ["wachtwoord", "reset", "vergeten", "herstel", "inloggen", "security"]
    },
    {
      id: 3,
      title: "Factuurgegevens wijzigen",
      excerpt: "Leer hoe je je factuurgegevens kunt aanpassen in je accountinstellingen...",
      content: "Handleiding voor het bijwerken van factuurinformatie...",
      category: "Facturering",
      author: "Lisa Bakker",
      updatedAt: "2024-01-12",
      views: 92,
      status: "Concept",
      featured: false,
      keywords: ["factuur", "betaling", "gegevens", "wijzigen", "rekening", "administratie"]
    },
    {
      id: 4,
      title: "Artikelen organiseren in categorieën",
      excerpt: "Leer hoe je je knowledge base kunt structureren met categorieën...",
      content: "Uitleg over het gebruik van categorieën...",
      category: "Aan de slag",
      author: "Tom Peters",
      updatedAt: "2024-01-10",
      views: 156,
      status: "Gepubliceerd",
      featured: false,
      keywords: ["categorieën", "organiseren", "structuur", "ordenen", "groeperen"]
    },
    {
      id: 5,
      title: "Technische problemen oplossen",
      excerpt: "Veelvoorkomende technische problemen en hun oplossingen...",
      content: "Troubleshooting guide voor technische issues...",
      category: "Technische ondersteuning",
      author: "Alex Johnson",
      updatedAt: "2024-01-08",
      views: 78,
      status: "Gepubliceerd",
      featured: false,
      keywords: ["technisch", "problemen", "oplossen", "error", "bug", "support"]
    }
  ];

  const categories = ["Aan de slag", "Account beheer", "Facturering", "Technische ondersteuning"];

  return (
    <UserContext.Provider value={{ user, setUser, isManager, articles, categories }}>
      {children}
    </UserContext.Provider>
  );
};
