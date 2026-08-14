export type Page = 'home' | 'design';

export type SidebarView = 'home' | 'tools' | 'plaza' | 'workspace' | 'starred' | 'recent' | 'shared' | 'help';

export interface CopiedApplicationTemplate {
  id: string;
  title: string;
  author: string;
  category: '基金研究' | '组合诊断' | '市场内容' | '财富规划';
  description: string;
  sourceUrl?: string;
  supportedDevices: Array<'desktop' | 'mobile'>;
  tools: {
    MCP: string[];
    Skills: string[];
    Agent: string[];
    组件: string[];
  };
}

export interface Project {
  id: string;
  kind?: 'chat' | 'project';
  /** 演示用：刷新后强制恢复为聊天，便于反复演示「聊天升级为项目」 */
  resetKindOnReload?: 'chat';
  name: string;
  description: string;
  thumbnail?: string;
  starred: boolean;
  pinned?: boolean;
  lastViewed?: string;
  sharedBy?: string;
  /** 从应用广场复制的完整应用快照；打开后直接进入可编辑项目，不再重新询问需求。 */
  templateSnapshot?: CopiedApplicationTemplate;
  /** 仅在首次复制模板时为 true；复制完成后持久化为 false，重新打开不再显示等待页。 */
  templateCopyPending?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
