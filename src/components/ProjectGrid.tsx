import { useState, useRef, useEffect } from 'react';
import { Star, MoreHorizontal, FolderKanban, Clock, Users, LifeBuoy, Sparkles, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { SidebarView, Project } from '@/types';

interface ProjectGridProps {
  view: SidebarView;
  projects: Project[];
  onOpenProject: (id: string) => void;
  onToggleStar: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
}

function getViewConfig(view: SidebarView): { title: string; subtitle: string; icon: typeof FolderKanban } {
  switch (view) {
    case 'workspace':
      return { title: '工作空间', subtitle: '集中管理你创建的所有项目', icon: FolderKanban };
    case 'starred':
      return { title: '已加星标', subtitle: '你收藏的项目', icon: Star };
    case 'recent':
      return { title: '最近查看', subtitle: '最近打开的项目', icon: Clock };
    case 'shared':
      return { title: '共享给你的', subtitle: '他人共享给你的项目', icon: Users };
    case 'help':
      return { title: '帮助中心', subtitle: '查找指南、教程和答案', icon: LifeBuoy };
    default:
      return { title: '主页', subtitle: '你的构建工作区', icon: Sparkles };
  }
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  return '刚刚';
}

export default function ProjectGrid({ view, projects, onOpenProject, onToggleStar, onRenameProject, onDeleteProject }: ProjectGridProps) {
  const config = getViewConfig(view);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenId]);

  const startRename = (project: Project) => {
    setRenamingId(project.id);
    setRenameValue(project.name);
    setMenuOpenId(null);
  };

  const confirmRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameProject(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmRename();
    } else if (e.key === 'Escape') {
      setRenamingId(null);
      setRenameValue('');
    }
  };

  if (view === 'help') {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-bolt-blue-light flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-bolt-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-bolt-light-12">帮助中心</h2>
            <p className="text-bolt-light-8 text-sm">查找指南、教程和答案</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {[
          { title: '入门指南', desc: '了解盈米的基础知识', icon: Sparkles, color: 'bg-bolt-blue' },
            { title: '项目与文件', desc: '管理、组织和分享你的工作', icon: FolderKanban, color: 'bg-bolt-green' },
            { title: '发布与托管', desc: '将项目部署到网络', icon: Users, color: 'bg-bolt-orange' },
            { title: '账户与账单', desc: '管理你的订阅和令牌', icon: Star, color: 'bg-bolt-purple' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-5 rounded-xl border border-bolt-light-5 bg-white hover:border-bolt-light-7 bolt-card-hover cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-[15px] font-semibold text-bolt-light-12 mb-1">{item.title}</h3>
                <p className="text-[13px] text-bolt-light-8">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-bolt-light-3 flex items-center justify-center mb-4">
          <config.icon className="w-8 h-8 text-bolt-light-7" />
        </div>
        <h3 className="text-lg font-semibold text-bolt-light-12 mb-1">暂无项目</h3>
        <p className="text-bolt-light-8 text-sm">开始构建，你的项目将显示在这里。</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bolt-blue-light flex items-center justify-center">
            <config.icon className="w-5 h-5 text-bolt-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-bolt-light-12">{config.title}</h2>
            <p className="text-bolt-light-8 text-sm">{config.subtitle}</p>
          </div>
        </div>
        <span className="text-[13px] text-bolt-light-7">{projects.length} 个项目</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => menuOpenId !== project.id && deleteConfirmId !== project.id && onOpenProject(project.id)}
            className="group rounded-xl border border-bolt-light-5 bg-white overflow-hidden cursor-pointer bolt-card-hover relative"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-bolt-light-3 to-bolt-light-5 relative overflow-hidden">
              <div className="absolute inset-0 bolt-grid-bg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                  <FolderKanban className="w-6 h-6 text-bolt-light-8" />
                </div>
              </div>
              {project.sharedBy && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 text-[11px] font-medium text-bolt-light-9 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  共享
                </div>
              )}
              {project.starred && (
                <div className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90">
                  <Star className="w-4 h-4 fill-bolt-yellow text-bolt-yellow" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                {renamingId === project.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={confirmRename}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="flex-1 text-[14px] font-semibold text-bolt-light-12 bg-bolt-light-2 border border-bolt-blue rounded-md px-2 py-0.5 outline-none"
                  />
                ) : (
                  <h3 className="text-[14px] font-semibold text-bolt-light-12 truncate flex-1">{project.name}</h3>
                )}
                <div className="relative" ref={menuOpenId === project.id ? menuRef : undefined}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === project.id ? null : project.id);
                    }}
                    className="p-1 rounded-md text-bolt-light-7 hover:bg-bolt-light-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {menuOpenId === project.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-bolt-light-5 bg-white shadow-lg py-1 animate-fade-in"
                    >
                      <button
                        onClick={() => { onOpenProject(project.id); setMenuOpenId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-bolt-light-11 hover:bg-bolt-light-3 transition-colors duration-100"
                      >
                        <ExternalLink className="w-4 h-4 text-bolt-light-7" />
                        打开
                      </button>
                      <button
                        onClick={() => startRename(project)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-bolt-light-11 hover:bg-bolt-light-3 transition-colors duration-100"
                      >
                        <Pencil className="w-4 h-4 text-bolt-light-7" />
                        重命名
                      </button>
                      <button
                        onClick={() => { onToggleStar(project.id); setMenuOpenId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-bolt-light-11 hover:bg-bolt-light-3 transition-colors duration-100"
                      >
                        <Star className={`w-4 h-4 text-bolt-light-7 ${project.starred ? 'fill-bolt-yellow text-bolt-yellow' : ''}`} />
                        {project.starred ? '取消星标' : '加星标'}
                      </button>
                      <div className="h-px bg-bolt-light-4 my-1" />
                      <button
                        onClick={() => { setDeleteConfirmId(project.id); setMenuOpenId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-bolt-red hover:bg-red-50 transition-colors duration-100"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[12.5px] text-bolt-light-8 mt-0.5 line-clamp-1">{project.description}</p>
              <div className="flex items-center gap-2 mt-3 text-[11.5px] text-bolt-light-7">
                {project.sharedBy ? (
                  <span>来自 {project.sharedBy}</span>
                ) : (
                  <span>创建于 {getRelativeTime(project.createdAt)}</span>
                )}
              </div>
            </div>

            {/* Delete confirmation overlay */}
            {deleteConfirmId === project.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in z-30"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <Trash2 className="w-6 h-6 text-bolt-red" />
                </div>
                <h4 className="text-[15px] font-semibold text-bolt-light-12 mb-1">确定删除此项目？</h4>
                <p className="text-[12.5px] text-bolt-light-8 mb-4 max-w-[200px]">
                  此操作无法撤销。「{project.name}」将被永久删除。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                    className="px-3 py-1.5 rounded-lg border border-bolt-light-5 text-[13px] font-medium text-bolt-light-9 hover:bg-bolt-light-3 transition-colors duration-150"
                  >
                    取消
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); setDeleteConfirmId(null); }}
                    className="px-3 py-1.5 rounded-lg bg-bolt-red text-white text-[13px] font-medium hover:bg-red-600 transition-colors duration-150"
                  >
                    删除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
