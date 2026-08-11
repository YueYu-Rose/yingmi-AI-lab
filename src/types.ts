export type Page = 'home' | 'design';

export type SidebarView = 'home' | 'tools' | 'plaza' | 'workspace' | 'starred' | 'recent' | 'shared' | 'help';

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
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
