import {
  Home,
  FolderKanban,
  Star,
  Clock,
  Users,
  LifeBuoy,
  Sparkles,
  ChevronDown,
  Zap,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import type { SidebarView, Project } from '@/types';

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onNewProject: () => void;
  onOpenProject: (id: string) => void;
  projects: Project[];
}

const navItems: { id: SidebarView; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '主页', icon: Home },
  { id: 'projects', label: '项目', icon: FolderKanban },
  { id: 'starred', label: '已加星标', icon: Star },
  { id: 'recent', label: '最近查看', icon: Clock },
  { id: 'shared', label: '共享给你的', icon: Users },
];

const projectColors = ['bg-bolt-blue', 'bg-bolt-green', 'bg-bolt-orange', 'bg-bolt-purple', 'bg-bolt-red', 'bg-bolt-yellow'];

export default function Sidebar({ activeView, onViewChange, onNewProject, onOpenProject, projects }: SidebarProps) {
  const [search, setSearch] = useState('');

  const personalProjects = projects.filter((p) => !p.sharedBy);
  const filteredPersonal = search.trim()
    ? personalProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : personalProjects.slice(0, 8);

  return (
    <aside className="w-[260px] shrink-0 border-r border-bolt-light-5 bg-bolt-light flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-bolt-light-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-bolt-blue flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-semibold text-bolt-light-12 text-[15px]">Bolt</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-1 px-2">
          <span className="text-[11px] font-medium text-bolt-light-7 tracking-wider">
            工作区
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13.5px] font-medium mb-0.5 transition-all duration-150 ${
                active
                  ? 'bg-bolt-light-4 text-bolt-light-12'
                  : 'text-bolt-light-9 hover:bg-bolt-light-3 hover:text-bolt-light-11'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${active ? 'text-bolt-blue' : ''}`} />
              {item.label}
            </button>
          );
        })}

        {/* Personal Space section */}
        <div className="mt-5 mb-1 px-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-bolt-light-7 tracking-wider">
            个人空间
          </span>
          <span className="text-[11px] text-bolt-light-7">{personalProjects.length}</span>
        </div>

        {/* Search within personal space */}
        <div className="relative mb-2 px-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bolt-light-7" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索项目..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-bolt-light-5 bg-bolt-light-2 text-[12.5px] text-bolt-light-12 placeholder:text-bolt-light-7 outline-none focus:border-bolt-blue focus:bg-white transition-colors duration-150"
          />
        </div>

        {filteredPersonal.length === 0 ? (
          <div className="px-2.5 py-3 text-[12px] text-bolt-light-7 text-center">
            {search.trim() ? '未找到匹配项' : '暂无项目'}
          </div>
        ) : (
          filteredPersonal.map((proj, idx) => (
            <button
              key={proj.id}
              onClick={() => onOpenProject(proj.id)}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13.5px] text-bolt-light-9 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-all duration-150"
            >
              <div className={`w-2 h-2 rounded-sm ${projectColors[idx % projectColors.length]}`} />
              <span className="truncate">{proj.name}</span>
              {proj.starred && <Star className="w-3 h-3 fill-bolt-yellow text-bolt-yellow ml-auto shrink-0" />}
            </button>
          ))
        )}

        {/* Help Center */}
        <div className="mt-5 mb-1 px-2">
          <span className="text-[11px] font-medium text-bolt-light-7 tracking-wider">
            支持
          </span>
        </div>
        <button
          onClick={() => onViewChange('help')}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13.5px] font-medium mb-0.5 transition-all duration-150 ${
            activeView === 'help'
              ? 'bg-bolt-light-4 text-bolt-light-12'
              : 'text-bolt-light-9 hover:bg-bolt-light-3 hover:text-bolt-light-11'
          }`}
        >
          <LifeBuoy className={`w-[18px] h-[18px] ${activeView === 'help' ? 'text-bolt-blue' : ''}`} />
          帮助中心
        </button>
      </nav>

      {/* New Project button */}
      <div className="p-3 border-t border-bolt-light-5">
        <button
          onClick={onNewProject}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bolt-blue text-white text-[13.5px] font-medium hover:bg-bolt-blue-dark transition-colors duration-150 bolt-glow"
        >
          <Sparkles className="w-4 h-4" />
          新建项目
        </button>
      </div>

      {/* User profile */}
      <div className="p-3 border-t border-bolt-light-5">
        <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-bolt-light-3 transition-colors duration-150">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-bolt-blue to-bolt-purple flex items-center justify-center text-white text-xs font-semibold">
            JD
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[13px] font-medium text-bolt-light-12 truncate">张伟</div>
            <div className="text-[11px] text-bolt-light-7 truncate">免费版</div>
          </div>
          <ChevronDown className="w-4 h-4 text-bolt-light-7" />
        </button>
      </div>
    </aside>
  );
}
