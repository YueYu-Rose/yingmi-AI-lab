import { useState } from 'react';
import { FolderKanban } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import PromptBox from '@/components/PromptBox';
import ProjectGrid from '@/components/ProjectGrid';
import ToolsPage from '@/pages/ToolsPage';
import type { SidebarView, Project } from '@/types';

interface FrontPageProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  projects: Project[];
  onToggleStar: (id: string) => void;
  onOpenProject: (id: string) => void;
  onNewProject: (prompt: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
}

const viewFilters: Record<SidebarView, (p: Project) => boolean> = {
  home: () => true,
  tools: () => false,
  workspace: () => true,
  starred: (p) => p.starred,
  recent: (p) => p.lastViewed !== undefined,
  shared: (p) => p.sharedBy !== undefined,
  help: () => false,
};


export default function FrontPage({ activeView, onViewChange, projects, onToggleStar, onOpenProject, onNewProject, onRenameProject, onDeleteProject }: FrontPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const isHome = activeView === 'home';
  const isTools = activeView === 'tools';
  const isWorkspace = activeView === 'workspace' || activeView === 'starred' || activeView === 'recent' || activeView === 'shared';

  const filteredProjects = projects
    .filter(viewFilters[activeView] || (() => true))
    .filter((p) =>
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex h-screen bg-bolt-light-2">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        onOpenProject={onOpenProject}
        projects={projects}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        {isWorkspace && (
          <div className="min-h-14 border-b border-bolt-light-5 bg-white flex items-center px-6 gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索项目..."
                className="w-full pl-3 pr-3 py-1.5 rounded-lg border border-bolt-light-5 bg-bolt-light-2 text-[13px] text-bolt-light-12 placeholder:text-bolt-light-7 outline-none focus:border-bolt-blue focus:bg-white transition-colors duration-150"
              />
            </div>
            <div className="ml-auto flex items-center rounded-lg bg-bolt-light-3 p-1">
              {([
                ['workspace', '全部项目'],
                ['starred', '已加星标'],
                ['recent', '最近查看'],
                ['shared', '共享给你'],
              ] as [SidebarView, string][]).map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => onViewChange(view)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${activeView === view ? 'bg-white text-bolt-light-12 shadow-sm' : 'text-bolt-light-8 hover:text-bolt-light-11'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto bolt-gradient-bg">
          {isHome ? (
            <div className="min-h-full flex flex-col items-center justify-center px-6 py-10">
              <div className="w-full">
                <PromptBox onSubmit={onNewProject} />

                {/* Recent chats and projects strip */}
                {projects.length > 0 && (
                  <div className="max-w-3xl mx-auto mt-12">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[13px] font-semibold text-bolt-light-9 tracking-wider">
                        最近
                      </h3>
                      <button
                        onClick={() => onViewChange('workspace')}
                        className="text-[13px] text-bolt-blue hover:underline font-medium"
                      >
                        查看全部
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {projects.slice(0, 3).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => onOpenProject(project.id)}
                          className="group rounded-xl border border-bolt-light-5 bg-white overflow-hidden cursor-pointer bolt-card-hover"
                        >
                          <div className="aspect-video bg-gradient-to-br from-bolt-light-3 to-bolt-light-5 relative bolt-grid-bg">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                                <FolderKanban className="w-5 h-5 text-bolt-light-8" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="text-[13px] font-semibold text-bolt-light-12 truncate">{project.name}</h4>
                            <p className="text-[11.5px] text-bolt-light-8 mt-0.5 truncate">{project.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isTools ? (
            <ToolsPage onStartCreating={() => onViewChange('home')} />
          ) : (
            <ProjectGrid
              view={activeView}
              projects={filteredProjects}
              onOpenProject={onOpenProject}
              onToggleStar={onToggleStar}
              onRenameProject={onRenameProject}
              onDeleteProject={onDeleteProject}
            />
          )}
        </div>
      </div>
    </div>
  );
}
