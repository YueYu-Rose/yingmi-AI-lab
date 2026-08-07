import {
  Home,
  FolderKanban,
  Star,
  LifeBuoy,
  ChevronDown,
  Search,
  Sparkles,
  Wrench,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { SidebarView, Project } from '@/types';

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onOpenProject: (id: string) => void;
  projects: Project[];
}

const navItems: { id: SidebarView; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '开始创建', icon: Sparkles },
  { id: 'tools', label: '盈米工具', icon: Wrench },
  { id: 'workspace', label: '工作空间', icon: FolderKanban },
];

export default function Sidebar({ activeView, onViewChange, onOpenProject, projects }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const personalProjects = projects.filter((p) => !p.sharedBy);
  const filteredPersonal = search.trim()
    ? personalProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : personalProjects.slice(0, 8);

  return (
    <aside className="w-[260px] shrink-0 border-r border-bolt-light-5 bg-bolt-light flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-bolt-light-5">
        <div className="flex items-center gap-2">
          <img src="/yimi-logo.png" alt="盈米" className="w-9 h-9 object-contain shrink-0" />
          <span className="font-semibold text-bolt-light-12 text-[15px]">盈米实验室</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-1 px-2">
          <span className="text-[11px] font-medium text-bolt-light-7 tracking-wider">
            导航
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

        {/* Recent chats and projects */}
        <div data-testid="workspace-recent-header" className="mt-5 mb-1 px-2 min-h-7 flex items-center gap-2">
          <span className="shrink-0 text-[11px] font-medium text-bolt-light-7 tracking-wider">
            最近
          </span>
          {searchOpen ? (
            <div className="relative min-w-0 flex-1 animate-fade-in">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-bolt-light-7" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSearch('');
                    setSearchOpen(false);
                  }
                }}
                placeholder="搜索最近内容..."
                aria-label="搜索最近的聊天和项目"
                className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-bolt-light-5 bg-white text-[11.5px] text-bolt-light-12 placeholder:text-bolt-light-7 outline-none focus:border-bolt-blue transition-colors"
              />
            </div>
          ) : (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[11px] text-bolt-light-7">{personalProjects.length}</span>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="搜索最近的聊天和项目"
                className="p-1.5 rounded-md text-bolt-light-7 hover:bg-bolt-light-3 hover:text-bolt-light-10 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {filteredPersonal.length === 0 ? (
          <div className="px-2.5 py-3 text-[12px] text-bolt-light-7 text-center">
            {search.trim() ? '未找到匹配内容' : '暂无最近内容'}
          </div>
        ) : (
          filteredPersonal.map((proj) => {
            const isChat = proj.kind === 'chat';
            const RecentIcon = isChat ? MessageCircle : FolderKanban;

            return (
              <button
                key={proj.id}
                onClick={() => onOpenProject(proj.id)}
                title={`${isChat ? '聊天' : '项目'}：${proj.name}`}
                className="group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] text-bolt-light-9 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-all duration-150"
              >
                <RecentIcon
                  aria-hidden="true"
                  className={`w-4 h-4 shrink-0 transition-colors ${isChat ? 'text-bolt-light-7 group-hover:text-bolt-purple' : 'text-bolt-light-7 group-hover:text-bolt-blue'}`}
                />
                <span className="truncate">{proj.name}</span>
                {proj.starred && <Star className="w-3 h-3 fill-bolt-yellow text-bolt-yellow ml-auto shrink-0" />}
              </button>
            );
          })
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
