import { useState } from 'react';
import FrontPage from '@/pages/FrontPage';
import DesignPage from '@/pages/DesignPage';
import type { Page, Project } from '@/types';

const initialProjects: Project[] = [
  {
    id: '1',
    name: '作品集网站',
    description: '展示个人项目的作品集网站',
    starred: true,
    lastViewed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '2',
    name: '加密货币仪表盘',
    description: '实时加密货币价格追踪器，带图表展示',
    starred: true,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: '3',
    name: '食谱应用',
    description: '浏览和收藏你喜欢的食谱',
    starred: false,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '4',
    name: '团队落地页',
    description: 'SaaS产品的营销落地页',
    starred: false,
    sharedBy: 'Sarah K.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: '5',
    name: '数据分析平台',
    description: '带筛选功能的数据可视化仪表盘',
    starred: false,
    sharedBy: 'Mike R.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: '6',
    name: '预约系统',
    description: '带日历的预约排程应用',
    starred: false,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const handleOpenProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setActiveProject(project);
      setCurrentPage('design');
    }
  };

  const handleNewProject = (prompt: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: prompt ? prompt.slice(0, 40) + (prompt.length > 40 ? '...' : '') : '未命名项目',
      description: prompt || '一个新的 Bolt 项目',
      starred: false,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(newProject);
    setCurrentPage('design');
  };

  const handleToggleStar = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p))
    );
    if (activeProject?.id === id) {
      setActiveProject((prev) => prev ? { ...prev, starred: !prev.starred } : prev);
    }
  };

  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
    if (activeProject?.id === id) {
      setActiveProject((prev) => prev ? { ...prev, name: newName } : prev);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleBack = () => {
    setCurrentPage('home');
    setActiveProject(null);
  };

  if (currentPage === 'design' && activeProject) {
    return <DesignPage project={activeProject} onBack={handleBack} />;
  }

  return (
    <FrontPage
      projects={projects}
      onToggleStar={handleToggleStar}
      onOpenProject={handleOpenProject}
      onNewProject={handleNewProject}
      onRenameProject={handleRenameProject}
      onDeleteProject={handleDeleteProject}
    />
  );
}

export default App;
