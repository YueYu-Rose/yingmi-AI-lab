import {
  Home,
  CircleHelp,
  CirclePlus,
  FolderKanban,
  Star,
  ChevronDown,
  Search,
  Wrench,
  LayoutGrid,
  MessageCircle,
  UserSquare2,
  LogOut,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SidebarView, Project } from '@/types';
import ProfileHomeModal from '@/components/ProfileHomeModal';

interface SidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onOpenProject: (id: string) => void;
  projects: Project[];
  compact?: boolean;
}

const navItems: { id: SidebarView; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '开始创建', icon: CirclePlus },
  { id: 'tools', label: '盈米工具', icon: Wrench },
  { id: 'plaza', label: '应用广场', icon: LayoutGrid },
  { id: 'workspace', label: '工作空间', icon: FolderKanban },
];

export default function Sidebar({ activeView, onViewChange, onOpenProject, projects, compact = false }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileHomeOpen, setProfileHomeOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [displayName, setDisplayName] = useState('张伟');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(event.target as Node)) {
        setSearch('');
        setSearchOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!loggingOut) return;
    const timer = window.setTimeout(() => setLoggingOut(false), 1600);
    return () => window.clearTimeout(timer);
  }, [loggingOut]);

  const personalProjects = projects.filter((p) => !p.sharedBy);
  const filteredPersonal = search.trim()
    ? personalProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : personalProjects.slice(0, 8);

  return (
    <aside className={`${compact ? 'w-16' : 'w-[260px]'} shrink-0 border-r border-bolt-light-5 bg-bolt-light flex flex-col h-full transition-[width] duration-200`}>
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-bolt-light-5 ${compact ? 'justify-center px-2' : 'px-4'}`}>
        <div className="flex items-center gap-2">
          <img src="/yimi-logo.png" alt="盈米" className="w-9 h-9 object-contain shrink-0" />
          {!compact && <span className="font-semibold text-bolt-light-12 text-[15px]">盈米实验室</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${compact ? 'overflow-visible px-2 py-3' : 'overflow-y-auto p-3'}`}>
        {!compact && <div className="mb-1 px-2">
          <span className="text-[11px] font-medium text-bolt-light-7 tracking-wider">
            导航
          </span>
        </div>}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={compact ? item.label : undefined}
              aria-label={item.label}
              className={`group relative w-full flex items-center rounded-lg text-[13.5px] font-medium mb-1 transition-all duration-150 ${compact ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2'} ${
                active
                  ? 'bg-bolt-light-4 text-bolt-light-12'
                  : 'text-bolt-light-9 hover:bg-bolt-light-3 hover:text-bolt-light-11'
              }`}
            >
              <Icon
                aria-hidden="true"
                strokeWidth={2}
                className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${active ? 'text-bolt-blue' : ''}`}
              />
              {!compact && item.label}
              {compact && (
                <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-bolt-light-12 px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Recent chats and projects */}
        {!compact && <div
          ref={searchAreaRef}
          data-testid="workspace-recent-header"
          className="mt-5 mb-1 px-2 min-h-7 flex items-center gap-2"
        >
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
        </div>}

        {!compact && (filteredPersonal.length === 0 ? (
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
        ))}

        {/* Help Center */}
        {!compact && <div className="mt-5 mb-1 px-2">
          <span className="text-[11px] font-medium text-bolt-light-7 tracking-wider">
            支持
          </span>
        </div>}
        <button
          onClick={() => onViewChange('help')}
          title={compact ? '帮助中心' : undefined}
          aria-label="帮助中心"
          className={`group relative w-full flex items-center rounded-lg text-[13.5px] font-medium mb-0.5 transition-all duration-150 ${compact ? 'mt-4 justify-center p-2.5' : 'gap-3 px-2.5 py-2'} ${
            activeView === 'help'
              ? 'bg-bolt-light-4 text-bolt-light-12'
              : 'text-bolt-light-9 hover:bg-bolt-light-3 hover:text-bolt-light-11'
          }`}
        >
          <CircleHelp
            aria-hidden="true"
            strokeWidth={2}
            className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${activeView === 'help' ? 'text-bolt-blue' : ''}`}
          />
          {!compact && '帮助中心'}
          {compact && (
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-bolt-light-12 px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              帮助中心
            </span>
          )}
        </button>
      </nav>

      {/* User profile */}
      <div className={`relative border-t border-bolt-light-5 ${compact ? 'p-2' : 'p-3'}`} ref={profileMenuRef}>
        <button
          type="button"
          aria-expanded={profileMenuOpen}
          aria-haspopup="menu"
          onClick={() => setProfileMenuOpen((open) => !open)}
          title={compact ? displayName : undefined}
          aria-label={compact ? `用户：${displayName}` : undefined}
          className={`group relative w-full flex items-center rounded-lg bg-white hover:bg-bolt-light-2 transition-colors duration-150 ${compact ? 'justify-center p-1.5' : 'gap-2.5 px-2 py-1.5'}`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-bolt-blue to-bolt-purple flex items-center justify-center text-white text-xs font-semibold">
            JD
          </div>
          {!compact && <div className="flex-1 text-left min-w-0">
            <div className="text-[13px] font-medium text-bolt-light-12 truncate">{displayName}</div>
            <div className="text-[11px] text-bolt-light-7 truncate">免费版</div>
          </div>}
          {!compact && <ChevronDown className={`w-4 h-4 text-bolt-light-7 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />}
          {compact && (
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-bolt-light-12 px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {displayName}
            </span>
          )}
        </button>

        {profileMenuOpen && (
          <div
            role="menu"
            className={`absolute bottom-[calc(100%-4px)] z-40 overflow-hidden rounded-xl border border-bolt-light-5 bg-white shadow-xl animate-fade-in ${compact ? 'left-2 w-48' : 'left-3 right-3'}`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setProfileMenuOpen(false);
                setProfileHomeOpen(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-[13.5px] text-bolt-light-10 hover:bg-bolt-light-2"
            >
              <UserSquare2 className="h-[18px] w-[18px] shrink-0 text-bolt-light-9" />
              个人主页
            </button>
            <div className="mx-3 border-t border-bolt-light-4" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setProfileMenuOpen(false);
                setLoggingOut(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-[13.5px] text-bolt-light-10 hover:bg-bolt-light-2"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0 text-bolt-light-9" />
              退出
            </button>
          </div>
        )}
      </div>

      <ProfileHomeModal
        open={profileHomeOpen}
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        onClose={() => setProfileHomeOpen(false)}
      />

      {loggingOut && (
        <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center">
          <div className="rounded-2xl bg-white px-8 py-5 text-center shadow-2xl animate-fade-in">
            <p className="text-[15px] font-semibold text-bolt-light-11">正在退出...</p>
          </div>
        </div>
      )}
    </aside>
  );
}
