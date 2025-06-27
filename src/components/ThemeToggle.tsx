
import { Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  return (
    <Button variant="outline" size="icon" className="bg-white border-gray-300 text-spacegray-600 hover:bg-gray-50">
      <Monitor className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">System theme</span>
    </Button>
  );
};
