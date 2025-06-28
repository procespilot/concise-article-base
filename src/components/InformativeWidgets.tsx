
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Newspaper, 
  Bookmark,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const InformativeWidgets = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Quick links data
  const quickLinks = [
    { title: 'Alle Artikelen', path: '/articles', description: 'Bekijk alle beschikbare artikelen' },
    { title: 'Categorieën', path: '/categories', description: 'Browse per categorie' },
    { title: 'Instellingen', path: '/settings', description: 'Persoonlijke voorkeuren' },
    { title: 'Gebruikers', path: '/users', description: 'Gebruikersbeheer' }
  ];

  // Sample news items
  const newsItems = [
    {
      title: 'Nieuwe functionaliteiten toegevoegd',
      date: new Date().toLocaleDateString('nl-NL'),
      type: 'update'
    },
    {
      title: 'Systeem onderhoud gepland',
      date: new Date(Date.now() + 86400000).toLocaleDateString('nl-NL'),
      type: 'maintenance'
    },
    {
      title: 'Maandelijkse statistieken beschikbaar',
      date: new Date().toLocaleDateString('nl-NL'),
      type: 'report'
    }
  ];

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        fullDate: date
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatTimeZone = (timezone: string, offset: number) => {
    const time = new Date(currentTime.getTime() + (offset * 60 * 60 * 1000));
    return time.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* World Clock Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Wereldklok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amsterdam</span>
              <span className="font-mono text-lg">
                {currentTime.toLocaleTimeString('nl-NL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New York</span>
              <span className="font-mono text-sm text-gray-600">
                {formatTimeZone('America/New_York', -6)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">London</span>
              <span className="font-mono text-sm text-gray-600">
                {formatTimeZone('Europe/London', -1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tokyo</span>
              <span className="font-mono text-sm text-gray-600">
                {formatTimeZone('Asia/Tokyo', 8)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Calendar Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Kalender
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateMonth('next')}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-3">
            <h3 className="font-medium">
              {selectedDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(day => (
              <div key={day} className="text-center font-medium text-gray-500 p-1">
                {day}
              </div>
            ))}
            {generateCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`
                  text-center p-1 rounded text-xs cursor-pointer hover:bg-gray-100
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                  ${day.isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                `}
              >
                {day.date}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* News Feed Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Newspaper className="w-4 h-4 mr-2" />
            Nieuws & Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {newsItems.map((item, index) => (
              <div key={index} className="border-l-2 border-blue-200 pl-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs"
                  >
                    {item.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links Widget */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bookmark className="w-4 h-4 mr-2" />
            Snelle Toegang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{link.title}</h4>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <p className="text-sm text-gray-600">{link.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InformativeWidgets;
