import { useEffect, useState } from 'react';
import FrontPage from '@/pages/FrontPage';
import DesignPage from '@/pages/DesignPage';
import type { Page, Project, SidebarView } from '@/types';

const familyFinanceChatSeed: Project = {
  id: 'c1',
  kind: 'chat',
  resetKindOnReload: 'chat',
  name: '想做个家庭理财小工具',
  description: '还在聊需求：希望做一个能看收支和目标进度的小工具',
  starred: false,
  lastViewed: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
};

const morningBriefChatSeed: Project = {
  id: 'c2',
  kind: 'chat',
  resetKindOnReload: 'chat',
  name: '市场早报要不要做成网页？',
  description: '还在讨论早报内容结构，尚未开始构建',
  starred: false,
  lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
};

/** 每次刷新：把可演示聊天项恢复为聊天，方便反复给 mentor 演示升级效果 */
function restoreDemoChatsOnReload(list: Project[]): Project[] {
  return list.map((item) => {
    if (item.id === 'c1') {
      return {
        ...familyFinanceChatSeed,
        starred: item.starred,
        lastViewed: item.lastViewed,
      };
    }

    const isMorningBriefDemo =
      item.id === 'c2' ||
      item.description?.includes('还在讨论早报') ||
      item.name === '市场早报要不要做成网页？';

    if (isMorningBriefDemo) {
      return {
        ...morningBriefChatSeed,
        starred: item.starred,
        lastViewed: item.lastViewed,
      };
    }

    if (item.resetKindOnReload === 'chat') {
      return {
        ...item,
        kind: 'chat',
        resetKindOnReload: 'chat',
      };
    }

    return item;
  });
}

const initialProjects: Project[] = [
  familyFinanceChatSeed,
  {
    id: '1',
    kind: 'project',
    name: '基金对比研究 Dashboard',
    description: '对比多只基金的收益、回撤、波动率与持仓',
    starred: true,
    lastViewed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: '2',
    kind: 'project',
    name: '组合健康诊断',
    description: '分析基金组合的资产配置、相关性与风险',
    starred: true,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  morningBriefChatSeed,
  {
    id: '3',
    kind: 'project',
    name: '市场早报网页',
    description: '聚合行情、财经资讯与基金经理观点',
    starred: false,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: '4',
    kind: 'project',
    name: '家庭财富规划报告',
    description: '覆盖收支、资产负债、目标与配置建议',
    starred: false,
    sharedBy: 'Sarah K.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: '5',
    kind: 'project',
    name: '基金筛选工具',
    description: '按绩效、风险与产品属性筛选基金',
    starred: false,
    sharedBy: 'Mike R.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: '6',
    kind: 'project',
    name: '资产配置模拟器',
    description: '根据目标需求模拟不同资产配置方案',
    starred: false,
    lastViewed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [frontView, setFrontView] = useState<SidebarView>('home');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = window.localStorage.getItem('yingmi-lab-projects-v2');
      if (!savedProjects) return initialProjects;
      return restoreDemoChatsOnReload(JSON.parse(savedProjects) as Project[]);
    } catch {
      return initialProjects;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('yingmi-lab-projects-v2', JSON.stringify(projects));
  }, [projects]);

  const createItem = (prompt: string, kind: 'chat' | 'project' = 'chat') => {
    const trimmed = prompt.trim();
    const newProject: Project = {
      id: Date.now().toString(),
      kind,
      resetKindOnReload: kind === 'chat' ? 'chat' : undefined,
      name: trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : ''),
      description: trimmed,
      starred: false,
      lastViewed: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(newProject);
    return newProject;
  };

  const handleOpenProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      const opened = { ...project, lastViewed: new Date().toISOString() };
      setProjects((prev) => prev.map((item) => (item.id === id ? opened : item)));
      setActiveProject(opened);
      setInitialPrompt(null);
      setCurrentPage('design');
    }
  };

  const handleNewProject = (prompt: string) => {
    if (prompt.trim()) {
      // 先以聊天进入，再由 AI 澄清后升级为项目
      createItem(prompt.trim(), 'chat');
      setInitialPrompt(prompt.trim());
    } else {
      setActiveProject(null);
      setInitialPrompt(null);
    }
    setCurrentPage('design');
  };

  const handleCreateProjectFromDraft = (prompt: string) => {
    const project = createItem(prompt, 'chat');
    setInitialPrompt(prompt);
    return project;
  };

  const handlePromoteToProject = (id: string, prompt: string) => {
    const trimmed = prompt.trim();
    setProjects((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              kind: 'project',
              // 保留 resetKindOnReload，刷新后仍回到聊天，方便反复演示
              resetKindOnReload: item.resetKindOnReload ?? (item.kind === 'chat' ? 'chat' : undefined),
              name: trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : ''),
              description: trimmed,
              lastViewed: new Date().toISOString(),
            }
          : item
      )
    );
    setActiveProject((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            kind: 'project',
            resetKindOnReload: prev.resetKindOnReload ?? (prev.kind === 'chat' ? 'chat' : undefined),
            name: trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : ''),
            description: trimmed,
            lastViewed: new Date().toISOString(),
          }
        : prev
    );
    setInitialPrompt(trimmed);
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
        onPromoteToProject={handlePromoteToProject}
        onBack={handleBack}
      />
    );
  }

  return (
    <FrontPage
      activeView={frontView}
      onViewChange={setFrontView}
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
