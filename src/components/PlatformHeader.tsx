import { KeyRound } from 'lucide-react';
import type { SidebarView } from '@/types';

interface PlatformHeaderProps {
  onViewChange: (view: SidebarView) => void;
}

const navItems = [
  { label: '首页', view: 'home' as SidebarView },
  { label: '盈米 MCP' },
  { label: '盈米 Skills' },
  { label: '盈米智能体' },
  { label: '客户案例' },
  { label: '盈米实验室', active: true },
];

export default function PlatformHeader({ onViewChange }: PlatformHeaderProps) {
  return (
    <header className="h-16 shrink-0 border-b border-bolt-light-5 bg-white px-6 flex items-center gap-8">
      <button
        type="button"
        onClick={() => onViewChange('home')}
        className="flex items-center gap-2.5 shrink-0"
        aria-label="返回盈米 AI 开放平台首页"
      >
        <img src="/yimi-logo.png" alt="盈米" className="h-9 w-9 object-contain" />
        <span className="text-[17px] font-semibold text-bolt-light-12">盈米 AI 开放平台</span>
      </button>

      <nav className="flex min-w-0 flex-1 items-stretch self-stretch" aria-label="开放平台导航">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => item.view && onViewChange(item.view)}
            className={`relative px-4 text-[13.5px] font-medium transition-colors ${
              item.active ? 'text-bolt-blue' : 'text-bolt-light-9 hover:text-bolt-light-12'
            }`}
          >
            {item.label}
            {item.active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-bolt-blue" />}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-bolt-blue px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-600"
      >
        <KeyRound className="h-4 w-4" />
        开通服务
      </button>
    </header>
  );
}
