import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="gap-2"
      data-testid="button-language-toggle"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{language === 'en' ? 'عربي' : 'English'}</span>
    </Button>
  );
}
