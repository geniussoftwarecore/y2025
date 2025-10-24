import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 gap-4 shrink-0">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
