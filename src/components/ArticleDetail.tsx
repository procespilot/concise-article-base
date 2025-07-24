
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Clock, Eye, Star, User, Tag, Edit, Share2, Bookmark, 
  ThumbsUp, ThumbsDown, Menu, ChevronRight, CheckCircle, AlertCircle,
  Info, Quote, Code, Table, FileText, BookOpen, Heart, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Rich content components
const Callout = ({ type = 'info', title, children }: { 
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}) => {
  const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
    error: AlertCircle
  };
  
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
  };

  const Icon = icons[type];

  return (
    <Alert className={cn('my-6 animate-fade-in', colors[type])}>
      <Icon className="h-4 w-4" />
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
};

const BlockQuote = ({ children, author }: { children: React.ReactNode; author?: string }) => (
  <blockquote className="my-8 pl-6 border-l-4 border-primary animate-fade-in max-w-[700px]">
    <Quote className="h-8 w-8 text-muted-foreground mb-4" />
    <div className="text-xl italic leading-[1.8] text-black mb-4">
      {children}
    </div>
    {author && (
      <cite className="text-sm text-gray-600 not-italic">— {author}</cite>
    )}
  </blockquote>
);

const CodeBlock = ({ children, language = 'text' }: { children: string; language?: string }) => (
  <div className="my-6 animate-fade-in">
    <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border">
      <div className="flex items-center gap-2">
        <Code className="h-4 w-4" />
        <span className="text-sm font-medium">{language}</span>
      </div>
    </div>
    <pre className="bg-muted/50 p-4 rounded-b-lg border-x border-b overflow-x-auto">
      <code className="text-sm font-mono">{children}</code>
    </pre>
  </div>
);

const ChecklistItem = ({ checked, children }: { checked: boolean; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 my-2 animate-fade-in max-w-[700px]">
    <CheckCircle className={cn(
      'h-5 w-5 mt-0.5 flex-shrink-0',
      checked ? 'text-success' : 'text-muted-foreground'
    )} />
    <span className={cn(
      'leading-[1.8]',
      checked ? 'text-black' : 'text-gray-600'
    )}>
      {children}
    </span>
  </div>
);

const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="my-6 animate-fade-in">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Info className="h-5 w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const TableOfContents = ({ content, activeSection }: { content: string; activeSection: string }) => {
  const headings = content.match(/^#{1,3}\s+(.+)$/gm) || [];
  
  if (headings.length < 3) return null; // Only show TOC for articles with 3+ headings

  return (
    <Card className="sticky top-24 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="h-4 w-4" />
          Inhoudsopgave
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <nav className="space-y-2">
            {headings.map((heading, index) => {
              const level = heading.match(/^#+/)?.[0].length || 1;
              const text = heading.replace(/^#+\s+/, '');
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              
              return (
                <a
                  key={index}
                  href={`#${id}`}
                  className={cn(
                    'block py-2 px-3 text-sm transition-all hover:bg-muted/50 rounded-md',
                    level === 1 && 'font-semibold text-foreground',
                    level === 2 && 'pl-6 font-medium text-foreground',
                    level === 3 && 'pl-9 text-muted-foreground',
                    activeSection === id ? 'bg-primary/10 text-primary border-l-2 border-primary' : ''
                  )}
                >
                  {text}
                </a>
              );
            })}
          </nav>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// TL;DR Takeaway Block Component
const TakeawayBlock = ({ article }: { article: any }) => {
  // Generate key takeaways - in real implementation, this could use AI
  const takeaways = [
    "Belangrijkste punt uit het artikel",
    "Sleutelpraktijk die geïmplementeerd kan worden",
    "Belangrijke consideratie om te onthouden"
  ];

  return (
    <Card className="my-8 bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-primary" />
          Dit moet je weten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {takeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">{index + 1}</span>
              </div>
              <span className="text-sm leading-relaxed text-black">{takeaway}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const RelatedArticles = ({ currentArticleId }: { currentArticleId: string }) => {
  // Mock related articles - in real implementation, this would use AI or content similarity
  const relatedArticles = [
    { id: '1', title: 'Gerelateerd artikel 1', excerpt: 'Een kort overzicht van het eerste gerelateerde artikel' },
    { id: '2', title: 'Gerelateerd artikel 2', excerpt: 'Meer informatie over het tweede onderwerp' },
    { id: '3', title: 'Gerelateerd artikel 3', excerpt: 'Volgende stappen en aanvullende informatie' }
  ];

  return (
    <div className="mt-12 space-y-6">
      <h3 className="text-2xl font-bold text-black flex items-center gap-2">
        <ChevronRight className="h-6 w-6" />
        Gerelateerde artikelen
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Card key={article.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <h4 className="font-semibold text-black mb-3 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {article.excerpt}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const FloatingActionBar = ({ 
  onShare, 
  onBookmark, 
  onEdit, 
  isBookmarked 
}: {
  onShare: () => void;
  onBookmark: () => void;
  onEdit?: () => void;
  isBookmarked: boolean;
}) => (
  <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2 animate-slide-in-right">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={onShare} className="shadow-lg">
          <Share2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">Delen</TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBookmark}
          className={cn(
            'shadow-lg',
            isBookmarked && 'bg-warning text-warning-foreground'
          )}
        >
          <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        {isBookmarked ? 'Uit bookmarks verwijderen' : 'Aan bookmarks toevoegen'}
      </TooltipContent>
    </Tooltip>

    {onEdit && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onEdit} size="icon" className="shadow-lg">
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Bewerken</TooltipContent>
      </Tooltip>
    )}
  </div>
);

interface ArticleDetailProps {
  article: any;
  onBack: () => void;
  onEdit?: () => void;
}

const ArticleDetail = ({ article, onBack, onEdit }: ArticleDetailProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll tracking for TOC
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3');
      const scrollPosition = window.scrollY + 100;

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i] as HTMLElement;
        if (heading.offsetTop <= scrollPosition) {
          setActiveSection(heading.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="animate-fade-in">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Artikel niet gevonden</h2>
          <p className="text-muted-foreground mt-2">Het artikel dat je zoekt bestaat niet of is verwijderd.</p>
        </div>
      </div>
    );
  };

  const handleRating = (score: number) => {
    setRating(score);
    console.log(`Artikel ${article.id} beoordeeld met ${score} sterren`);
  };

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    console.log(`Artikel ${article.id} feedback: ${type}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    console.log(`Artikel ${article.id} ${isBookmarked ? 'uit bookmarks verwijderd' : 'aan bookmarks toegevoegd'}`);
  };

  const renderContent = (content: string) => {
    // Simple content parsing - in real implementation, use a proper markdown parser
    const sections = content.split('\n\n');
    
    return sections.map((section, index) => {
      // Handle headings
      if (section.match(/^#{1,3}\s+/)) {
        const level = section.match(/^#+/)?.[0].length || 1;
        const text = section.replace(/^#+\s+/, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            key={index}
            id={id}
            className={cn(
              'font-bold leading-tight mt-12 mb-6 scroll-mt-24 text-black max-w-[700px]',
              level === 1 && 'text-3xl',
              level === 2 && 'text-2xl',
              level === 3 && 'text-xl'
            )}
          >
            {text}
          </HeadingTag>
        );
      }

      // Handle callouts
      if (section.startsWith('[!')) {
        const match = section.match(/\[!(.*?)\]\s*(.*?)\n([\s\S]*)/);
        if (match) {
          const [, type, title, content] = match;
          return (
            <Callout key={index} type={type as any} title={title}>
              {content}
            </Callout>
          );
        }
      }

      // Handle quotes
      if (section.startsWith('>')) {
        const lines = section.split('\n');
        const quoteText = lines.filter(line => line.startsWith('>')).map(line => line.slice(1).trim()).join('\n');
        const author = lines.find(line => line.startsWith('--'))?.slice(2).trim();
        
        return (
          <BlockQuote key={index} author={author}>
            {quoteText}
          </BlockQuote>
        );
      }

      // Handle code blocks
      if (section.startsWith('```')) {
        const lines = section.split('\n');
        const language = lines[0].slice(3);
        const code = lines.slice(1, -1).join('\n');
        
        return (
          <CodeBlock key={index} language={language}>
            {code}
          </CodeBlock>
        );
      }

      // Handle checklists
      if (section.includes('- [ ]') || section.includes('- [x]')) {
        const items = section.split('\n').filter(line => line.trim().match(/^- \[[ x]\]/));
        
        return (
          <div key={index} className="my-6">
            {items.map((item, itemIndex) => {
              const checked = item.includes('[x]');
              const text = item.replace(/^- \[[ x]\]\s*/, '');
              return (
                <ChecklistItem key={itemIndex} checked={checked}>
                  {text}
                </ChecklistItem>
              );
            })}
          </div>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="mb-6 leading-[1.8] text-black max-w-[700px]">
          {section}
        </p>
      );
    });
  };

  return (
    <div className={cn('animate-fade-in', readingMode && 'max-w-2xl mx-auto')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar overzicht
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReadingMode(!readingMode)}
          >
            <FileText className="h-4 w-4 mr-2" />
            {readingMode ? 'Verlaat' : 'Start'} leesmodus
          </Button>
          
          {/* Mobile actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBookmark}
              className={cn(isBookmarked && 'bg-warning text-warning-foreground')}
            >
              <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
            </Button>
            {onEdit && (
              <Button onClick={onEdit} size="icon">
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          <article className="space-y-8">
            {/* Article header */}
            <header className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {article.featured && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Uitgelicht
                  </Badge>
                )}
                <Badge variant="outline">
                  {article.categories?.name || 'Geen categorie'}
                </Badge>
                <Badge variant={article.status === "Gepubliceerd" ? "default" : "outline"}>
                  {article.status}
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-[1.2] text-black max-w-[700px]">
                {article.title}
              </h1>
              
              {article.excerpt && (
                <p className="text-xl leading-[1.6] text-gray-700 max-w-[700px]">
                  {article.excerpt}
                </p>
              )}

              {/* Streamlined Metadata */}
              <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>
                    {article.profiles 
                      ? `${article.profiles.first_name || ''} ${article.profiles.last_name || ''}`.trim() || 'Onbekend'
                      : 'Onbekend'
                    }
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Bijgewerkt {new Date(article.updated_at).toLocaleDateString('nl-NL')}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.views} weergaven</span>
                </div>
              </div>

              {/* Keywords */}
              {article.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground mt-1" />
                  {article.keywords.map((keyword: string) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {/* TL;DR Takeaway Block */}
            <TakeawayBlock article={article} />

            {/* Article content */}
            <main 
              ref={contentRef}
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24"
            >
              {renderContent(article.content)}
            </main>

            {/* Feedback section */}
            <Card className="mt-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Was dit artikel nuttig?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant={feedback === 'helpful' ? 'default' : 'outline'}
                    onClick={() => handleFeedback('helpful')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Ja, nuttig
                  </Button>
                  <Button
                    variant={feedback === 'not-helpful' ? 'destructive' : 'outline'}
                    onClick={() => handleFeedback('not-helpful')}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="w-4 w-4" />
                    Niet nuttig
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Beoordeling:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={cn(
                        'w-6 h-6 transition-all hover:scale-110',
                        star <= rating ? 'text-warning' : 'text-muted-foreground hover:text-warning/70'
                      )}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground animate-fade-in">
                      Bedankt voor je beoordeling!
                    </span>
                  )}
                </div>
                
                {feedback && (
                  <Alert className="animate-fade-in">
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      {feedback === 'helpful' 
                        ? "Dank je wel! Je feedback helpt ons om betere content te maken." 
                        : "Bedankt voor je feedback. We zullen dit artikel verbeteren."
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Related articles */}
            <RelatedArticles currentArticleId={article.id} />
          </article>
        </div>

        {/* Sidebar - TOC */}
        {!readingMode && (
          <aside className="lg:col-span-1">
            <TableOfContents content={article.content} activeSection={activeSection} />
          </aside>
        )}
      </div>

      {/* Floating action bar */}
      <FloatingActionBar
        onShare={handleShare}
        onBookmark={handleBookmark}
        onEdit={onEdit}
        isBookmarked={isBookmarked}
      />
    </div>
  );
};

export default ArticleDetail;
