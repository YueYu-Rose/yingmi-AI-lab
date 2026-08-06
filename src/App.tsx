import { useEffect, useState } from 'react';
import FrontPage from '@/pages/FrontPage';
import DesignPage from '@/pages/DesignPage';
import type { Page, Project } from '@/types';

const initialProjects: Project[] = [
  {
    id: '1',
    name: '基金对比研究 Dashboard',
    description: '对比多只基金的收益、回撤、波动率与持仓',
    starred: true,
    lastViewed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '2',
    name: '组合健康诊断',
    description: '分析基金组合的资产配置、相关性与风险',
    starred: true,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: '3',
    name: '市场早报网页',
    description: '聚合行情、财经资讯与基金经理观点',
    starred: false,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '4',
    name: '家庭财富规划报告',
    description: '覆盖收支、资产负债、目标与配置建议',
    starred: false,
    sharedBy: 'Sarah K.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: '5',
    name: '基金筛选工具',
    description: '按绩效、风险与产品属性筛选基金',
    starred: false,
    sharedBy: 'Mike R.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: '6',
    name: '资产配置模拟器',
    description: '根据目标需求模拟不同资产配置方案',
    starred: false,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = window.localStorage.getItem('yingmi-lab-projects');
      return savedProjects ? JSON.parse(savedProjects) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('yingmi-lab-projects', JSON.stringify(projects));
  }, [projects]);

  const createProject = (prompt: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: prompt.slice(0, 40) + (prompt.length > 40 ? '...' : ''),
      description: prompt,
      starred: false,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(newProject);
    return newProject;
  };

  const handleOpenProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setActiveProject(project);
      setInitialPrompt(null);
      setCurrentPage('design');
    }
  };

  const handleNewProject = (prompt: string) => {
    if (prompt.trim()) {
      createProject(prompt.trim());
      setInitialPrompt(prompt.trim());
    } else {
      setActiveProject(null);
      setInitialPrompt(null);
    }
    setCurrentPage('design');
  };

  const handleCreateProjectFromDraft = (prompt: string) => {
    const project = createProject(prompt);
    setInitialPrompt(prompt);
    return project;
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
    setInitialPrompt(null);
  };

  if (currentPage === 'design') {
    return (
      <DesignPage
        project={activeProject}
        initialPrompt={initialPrompt}
        onCreateProject={handleCreateProjectFromDraft}
        onBack={handleBack}
      />
    );
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
