import {
  Home,
  Bell,
  CircleHelp,
  CirclePlus,
  FolderKanban,
  Star,
  ChevronDown,
  Search,
  Wrench,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  StarOff,
  Trash2,
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
  onToggleStar: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
  projects: Project[];
  compact?: boolean;
  onCompactChange?: (compact: boolean) => void;
  showLogo?: boolean;
}

const navItems: { id: SidebarView; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '开始创建', icon: CirclePlus },
  { id: 'plaza', label: '应用广场', icon: LayoutGrid },
  { id: 'workspace', label: '工作空间', icon: FolderKanban },
  { id: 'tools', label: '能力中心', icon: Wrench },
];

function SidebarToggleIcon({ compact }: { compact: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5h18M3 19h18" />
      {compact ? (
        <>
          <path d="M3 12h11" />
          <path d="m17 9 3 3-3 3" />
        </>
      ) : (
        <>
          <path d="M10 12h11" />
          <path d="m7 9-3 3 3 3" />
        </>
      )}
    </svg>
  );
}

export default function Sidebar({ activeView, onViewChange, onOpenProject, onToggleStar, onTogglePin, onRenameProject, onDeleteProject, projects, compact = false, onCompactChange, showLogo = true }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileHomeOpen, setProfileHomeOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [displayName, setDisplayName] = useState('余悦');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const recentMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpenId) return;
    const onPointerDown = (event: PointerEvent) => {
      if (recentMenuRef.current && !recentMenuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpenId]);

  const personalProjects = projects
    .filter((p) => !p.sharedBy)
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  const filteredPersonal = search.trim()
    ? personalProjects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : personalProjects.slice(0, 8);

  const startRename = (project: Project) => {
    setMenuOpenId(null);
    setRenamingId(project.id);
    setRenameValue(project.name);
  };

  const commitRename = (project: Project) => {
    const nextName = renameValue.trim();
    if (nextName && nextName !== project.name) onRenameProject(project.id, nextName);
    setRenamingId(null);
    setRenameValue('');
  };

  const deleteProject = (project: Project) => {
    setMenuOpenId(null);
    const typeLabel = project.kind === 'chat' ? '聊天' : '项目';
    if (window.confirm(`确定删除${typeLabel}「${project.name}」吗？此操作无法撤销。`)) {
      onDeleteProject(project.id);
    }
  };

  return (
    <aside className={`${compact ? 'w-16' : 'w-[260px]'} shrink-0 border-r border-bolt-light-5 bg-bolt-light flex flex-col h-full transition-[width] duration-200`}>
      {/* Logo */}
      {showLogo && (
        <div className={`flex h-14 items-center border-b border-bolt-light-5 ${compact ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {!compact && <div className="flex min-w-0 items-center gap-2">
            <img src="/yimi-logo.png" alt="盈米" className="w-9 h-9 object-contain shrink-0" />
            <span className="truncate font-semibold text-bolt-light-12 text-[15px]">盈米实验室</span>
          </div>}
          <button
            type="button"
            onClick={() => onCompactChange?.(!compact)}
            title={compact ? '展开导航栏' : '收起导航栏'}
            aria-label={compact ? '展开左侧导航栏' : '收起左侧导航栏'}
            className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-bolt-light-8 transition-colors hover:bg-bolt-light-3 hover:text-bolt-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolt-blue/40"
          >
            <SidebarToggleIcon compact={compact} />
            {compact && (
              <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-bolt-light-12 px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                展开导航栏
              </span>
            )}
          </button>
        </div>
      )}

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
              className={`group relative flex items-center rounded-lg text-[13.5px] font-medium mb-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolt-blue/40 ${compact ? 'mx-auto h-10 w-10 justify-center p-0' : 'w-full gap-3 px-2.5 py-2'} ${
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
              <div
                key={proj.id}
                className={`group relative mb-0.5 flex w-full items-center rounded-lg text-[13.5px] text-bolt-light-9 transition-colors ${menuOpenId === proj.id ? 'bg-bolt-light-3 text-bolt-light-11' : 'hover:bg-bolt-light-3 hover:text-bolt-light-11'}`}
              >
                {renamingId === proj.id ? (
                  <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5">
                    <RecentIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-bolt-light-7" />
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      onBlur={() => commitRename(proj)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') commitRename(proj);
                        if (event.key === 'Escape') {
                          setRenamingId(null);
                          setRenameValue('');
                        }
                      }}
                      aria-label={`重命名${isChat ? '聊天' : '项目'}`}
                      className="h-7 min-w-0 flex-1 rounded-md border border-bolt-blue bg-white px-2 text-[12.5px] text-bolt-light-12 outline-none"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenProject(proj.id)}
                    title={`${isChat ? '聊天' : '项目'}：${proj.name}`}
                    className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left"
                  >
                    <RecentIcon
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 transition-colors ${isChat ? 'text-bolt-light-7 group-hover:text-bolt-purple' : 'text-bolt-light-7 group-hover:text-bolt-blue'}`}
                    />
                    <span className="truncate">{proj.name}</span>
                    {(proj.pinned || proj.starred) && (
                      <span className="ml-auto flex shrink-0 items-center gap-1">
                        {proj.pinned && <Pin className="h-3 w-3 text-bolt-blue" aria-label="已置顶" />}
                        {proj.starred && <Star className="h-3 w-3 fill-bolt-yellow text-bolt-yellow" aria-label="已加星标" />}
                      </span>
                    )}
                  </button>
                )}

                {renamingId !== proj.id && (
                  <button
                    type="button"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuOpenId((current) => current === proj.id ? null : proj.id);
                    }}
                    aria-label={`更多${isChat ? '聊天' : '项目'}操作`}
                    aria-expanded={menuOpenId === proj.id}
                    className={`mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-bolt-light-7 transition hover:bg-white hover:text-bolt-light-11 ${menuOpenId === proj.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                )}

                {menuOpenId === proj.id && (
                  <div ref={recentMenuRef} className="absolute right-1 top-[calc(100%-2px)] z-50 w-36 overflow-hidden rounded-lg border border-bolt-light-5 bg-white py-1 shadow-xl">
                    <button type="button" onClick={() => startRename(proj)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-bolt-light-10 hover:bg-bolt-light-3">
                      <Pencil className="h-3.5 w-3.5 text-bolt-light-7" />
                      重命名
                    </button>
                    <button type="button" onClick={() => { onToggleStar(proj.id); setMenuOpenId(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-bolt-light-10 hover:bg-bolt-light-3">
                      {proj.starred ? <StarOff className="h-3.5 w-3.5 text-bolt-light-7" /> : <Star className="h-3.5 w-3.5 text-bolt-light-7" />}
                      {proj.starred ? '取消星标' : '加星标'}
                    </button>
                    <button type="button" onClick={() => { onTogglePin(proj.id); setMenuOpenId(null); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-bolt-light-10 hover:bg-bolt-light-3">
                      {proj.pinned ? <PinOff className="h-3.5 w-3.5 text-bolt-light-7" /> : <Pin className="h-3.5 w-3.5 text-bolt-light-7" />}
                      {proj.pinned ? '取消置顶' : '置顶'}
                    </button>
                    <div className="my-1 border-t border-bolt-light-5" />
                    <button type="button" onClick={() => deleteProject(proj)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] text-bolt-red hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </button>
                  </div>
                )}
              </div>
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
        <button
          type="button"
          title={compact ? '消息通知' : undefined}
          aria-label="消息通知"
          className={`group relative w-full flex items-center rounded-lg text-[13.5px] font-medium transition-all duration-150 ${compact ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2'} text-bolt-light-9 hover:bg-bolt-light-3 hover:text-bolt-light-11`}
        >
          <Bell aria-hidden="true" strokeWidth={2} className="h-[18px] w-[18px] shrink-0" />
          {!compact && '消息通知'}
          {compact && (
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-bolt-light-12 px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              消息通知
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
