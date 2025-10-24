import { SidebarTrigger } from '@/components/ui/sidebar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
