export type PublishedPlazaCategory = '基金研究' | '组合诊断' | '市场内容' | '财富规划';

export interface PublishedPlazaApp {
  id: string;
  title: string;
  author: string;
  category: PublishedPlazaCategory;
  description: string;
  cover: string;
  likes: number;
  views: number;
  tools: {
    MCP: string[];
    Skills: string[];
    Agent: string[];
    组件: string[];
  };
  supportedDevices: Array<'desktop' | 'mobile'>;
  /** 当前应用的真实预览地址；发布模板副本时沿用原应用页面，不再生成预设页面。 */
  sourceUrl?: string;
  isTemplate: boolean;
  publishedAt: string;
  shareUrl: string;
}

export const PLAZA_PUBLISHED_KEY = 'yingmi-plaza-published-v1';
const REMOVE_TWO_YUYUE_PUBLICATIONS_KEY = 'yingmi-plaza-remove-two-yuyue-v1';

function isRemovedDemoPublication(item: PublishedPlazaApp) {
  const removedDemoTitles = [
    '做一个基金组合健康诊断工具，分析资产配置、相关性与风险',
    '资产配置模拟器',
    '请使用「纳指管家」模板',
    '分析基金组合的资产配置、相关性与风险',
  ];

  return removedDemoTitles.some((title) =>
    item.title.includes(title) || item.description.includes(title)
  );
}

export function loadPublishedPlazaApps(): PublishedPlazaApp[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(PLAZA_PUBLISHED_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    const shouldRemoveYuyuePublications = window.localStorage.getItem(REMOVE_TWO_YUYUE_PUBLICATIONS_KEY) !== 'done';
    let removedYuyueCount = 0;
    const filtered = (value as PublishedPlazaApp[]).filter((item) => {
      if (isRemovedDemoPublication(item)) return false;
      if (shouldRemoveYuyuePublications && item.author === '余悦' && removedYuyueCount < 2) {
        removedYuyueCount += 1;
        return false;
      }
      return true;
    });
    if (shouldRemoveYuyuePublications) {
      window.localStorage.setItem(REMOVE_TWO_YUYUE_PUBLICATIONS_KEY, 'done');
    }
    if (filtered.length !== value.length) {
      window.localStorage.setItem(PLAZA_PUBLISHED_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function upsertPublishedPlazaApp(app: PublishedPlazaApp) {
  const current = loadPublishedPlazaApps();
  const next = [app, ...current.filter((item) => item.id !== app.id)];
  window.localStorage.setItem(PLAZA_PUBLISHED_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('yingmi-plaza-published', { detail: app }));
}
