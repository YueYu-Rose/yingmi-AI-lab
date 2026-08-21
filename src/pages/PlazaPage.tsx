import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Bot,
  ChevronDown,
  ChevronUp,
  Compass,
  Database,
  Eye,
  Heart,
  LayoutGrid,
  Monitor,
  PanelsTopLeft,
  PlugZap,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  Workflow,
} from 'lucide-react';
import { loadPublishedPlazaApps } from '@/lib/plazaPublishing';
import type { CopiedApplicationTemplate } from '@/types';

type Category = '基金研究' | '组合诊断' | '市场内容' | '财富规划';
type ToolKind = 'MCP' | 'Skills' | 'Agent' | '组件';
type PreviewMode = 'desktop' | 'mobile';
type PublisherFilter = 'all' | 'official' | 'user';

interface PlazaTemplate {
  id: string;
  title: string;
  author: string;
  official?: boolean;
  category: Category;
  description: string;
  cover: string;
  likes: number;
  views: number;
  tools: Record<ToolKind, string[]>;
  sourceUrl?: string;
  accent?: 'orange' | 'blue';
  supportedDevices: PreviewMode[];
  isTemplate?: boolean;
  publishedAt?: string;
}

const toolTabs: { id: ToolKind; icon: typeof Database }[] = [
  { id: 'MCP', icon: PlugZap },
  { id: 'Skills', icon: Workflow },
  { id: 'Agent', icon: Bot },
  { id: '组件', icon: PanelsTopLeft },
];

const publisherTabs: { id: PublisherFilter; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: '全部', icon: LayoutGrid },
  { id: 'official', label: '官方', icon: BadgeCheck },
  { id: 'user', label: '用户', icon: Users },
];

const mcpCatalog: Record<string, { category: string; description: string }> = {
  搜索基金: { category: '基金数据', description: '按多维条件搜索筛选目标基金产品清单' },
  基金净值历史: { category: '基金数据', description: '批量获取基金历史净值走势及区间表现数据' },
  批量获取基金详情: { category: '基金数据', description: '批量获取基金基础详情及产品属性信息' },
  基金风险分析: { category: '基金数据', description: '评估单只或多只基金的风险收益特征与暴露' },
  基金交易限制信息: { category: '基金数据', description: '批量查询基金交易状态限额及申赎限制信息' },
  基金代码模糊匹配: { category: '金融工具', description: '将模糊基金名称智能匹配为准确基金代码' },
  基金诊断: { category: '投前分析', description: '对单只基金进行多维度的全景量化诊断分析' },
  基金相关性分析: { category: '投后诊断', description: '计算多只基金之间的收益相关性与联动关系' },
  市场温度计: { category: '投前分析', description: '输出市场温度指标及核心宽基指数行情快照' },
  财经资讯: { category: '公开内容', description: '检索财经资讯内容并提取核心事件摘要信息' },
  行业收益: { category: '基金数据', description: '拆解基金收益在不同行业层面的具体贡献来源' },
  获取基金投资方案: { category: '投资顾问', description: '按配置目标生成对应的底层基金组合方案' },
};

const initialTemplates: PlazaTemplate[] = [
  {
    id: 'qdii-quota-manager',
    title: '额度管家',
    author: '王钊灏',
    category: '基金研究',
    description: '针对QDII基金单只产品每日申购额度有限的问题，用户输入计划金额后，应用会自动筛选可申购基金、分配买入金额并批量申购；还可设置每日定投持续补齐额度，减少逐只尝试和限购中断。',
    cover: '/plaza/qdii-quota-manager.svg',
    likes: 0,
    views: 0,
    sourceUrl: 'https://qieman.com/mix-pay/qdii-calculator?source=home_shortcuts',
    accent: 'blue',
    supportedDevices: ['desktop', 'mobile'],
    tools: {
      MCP: ['搜索基金', '批量获取基金详情', '基金交易限制信息'],
      Skills: [],
      Agent: [],
      组件: ['额度状态表', '金额分配器', '定投计划'],
    },
  },
  {
    id: 'nasdaq-butler',
    title: '纳指管家',
    author: '王钊灏',
    category: '基金研究',
    description: '对比 25 只以上纳斯达克 100 基金的费率、实测跟踪误差、限额、规模与赎回速度，并按综合最优、大额定投、跟踪精度等场景辅助选择；还可自定义基金比例，实时计算组合费率、跟踪误差和每日可投额度。',
    cover: '/plaza/nasdaq-butler.svg',
    likes: 0,
    views: 0,
    sourceUrl: 'https://qieman.com/mix-pay/nasdaq-butler',
    accent: 'blue',
    supportedDevices: ['desktop'],
    tools: {
      MCP: ['搜索基金', '批量获取基金详情', '基金交易限制信息', '基金风险分析'],
      Skills: ['fund-analyst'],
      Agent: ['纳指基金研究 Agent'],
      组件: ['基金对比表', '场景推荐', '组合计算器'],
    },
  },
  {
    id: 'fund-comparison',
    title: '基金对比研究 Dashboard',
    author: '盈米研究团队',
    official: true,
    category: '基金研究',
    description: '输入基金名称即可完成业绩、回撤、风险收益和持仓结构的多维比较，快速生成适合汇报与研究的可视化页面。',
    cover: '/plaza/fund-comparison.png',
    likes: 420,
    views: 3400,
    supportedDevices: ['desktop', 'mobile'],
    tools: {
      MCP: ['基金代码模糊匹配', '批量获取基金详情', '基金净值历史'],
      Skills: ['fund-analyst', 'design-data-visualization'],
      Agent: ['基金研究 Agent'],
      组件: ['指标卡', '收益曲线', '基金对比表'],
    },
  },
  {
    id: 'market-brief',
    title: '市场早报生成器',
    author: '盈米内容实验室',
    official: true,
    category: '市场内容',
    description: '聚合指数表现、市场事件和板块涨跌，用结构化页面生成每天可快速阅读的市场早报。',
    cover: '/plaza/market-brief.png',
    likes: 358,
    views: 2800,
    supportedDevices: ['desktop', 'mobile'],
    tools: {
      MCP: ['市场温度计', '财经资讯', '行业收益'],
      Skills: ['market-brief-writer'],
      Agent: ['市场解读 Agent'],
      组件: ['行情卡片', '事件时间轴', '板块柱状图'],
    },
  },
  {
    id: 'family-wealth',
    title: '家庭财富规划报告',
    author: '周予安',
    category: '财富规划',
    description: '整理家庭资产、现金流和长期目标，形成清晰的财富健康度、目标进度与配置建议页面。',
    cover: '/plaza/family-wealth.png',
    likes: 198,
    views: 1600,
    supportedDevices: ['desktop', 'mobile'],
    tools: {
      MCP: ['搜索基金', '获取基金投资方案'],
      Skills: ['wealth-planner', 'report-designer'],
      Agent: ['家庭财富 Agent'],
      组件: ['现金流图', '目标进度', '配置建议'],
    },
  },
];

const PLAZA_METRICS_KEY = 'yingmi-plaza-metrics-v1';
const PLAZA_LIKES_KEY = 'yingmi-plaza-liked-v1';

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace('.0', '')}K`;
  return String(value);
}

function getToolCategory(kind: ToolKind, tool: string) {
  if (kind === 'Skills') return 'Skill';
  if (kind === 'Agent') return 'Agent';
  if (kind === '组件') return '组件';
  return mcpCatalog[tool]?.category ?? '待核对';
}

function getToolDescription(kind: ToolKind, tool: string) {
  if (kind === 'Skills') return `使用 ${tool} 完成项目所需的分析、内容组织或可视化。`;
  if (kind === 'Agent') return `由 ${tool} 规划任务，并按需调用相关能力。`;
  if (kind === '组件') return `使用 ${tool} 呈现应用中的数据与分析结果。`;
  return mcpCatalog[tool]?.description ?? '暂无官方介绍';
}

function loadTemplates(): PlazaTemplate[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PLAZA_METRICS_KEY) ?? '{}') as Record<string, { likes?: number; views?: number }>;
    const published = loadPublishedPlazaApps();
    return [...published, ...initialTemplates].map((template) => ({
      ...template,
      likes: saved[template.id]?.likes ?? template.likes,
      views: saved[template.id]?.views ?? template.views,
    }));
  } catch {
    return initialTemplates;
  }
}

interface PlazaPageProps {
  onUseTemplate: (template: CopiedApplicationTemplate) => void;
  onDetailChange?: (open: boolean) => void;
}

export default function PlazaPage({ onUseTemplate, onDetailChange }: PlazaPageProps) {
  const [templates, setTemplates] = useState<PlazaTemplate[]>(loadTemplates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(() => new URLSearchParams(window.location.search).get('author'));
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(PLAZA_LIKES_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  });
  const [query, setQuery] = useState('');
  const [publisherFilter, setPublisherFilter] = useState<PublisherFilter>('all');

  const selected = templates.find((template) => template.id === selectedId) ?? null;

  useEffect(() => {
    const metrics = Object.fromEntries(templates.map(({ id, likes, views }) => [id, { likes, views }]));
    window.localStorage.setItem(PLAZA_METRICS_KEY, JSON.stringify(metrics));
  }, [templates]);

  useEffect(() => {
    window.localStorage.setItem(PLAZA_LIKES_KEY, JSON.stringify(likedIds));
  }, [likedIds]);

  useEffect(() => {
    const syncPublished = () => setTemplates(loadTemplates());
    window.addEventListener('yingmi-plaza-published', syncPublished);
    window.addEventListener('yingmi-plaza-unpublished', syncPublished);
    window.addEventListener('storage', syncPublished);
    return () => {
      window.removeEventListener('yingmi-plaza-published', syncPublished);
      window.removeEventListener('yingmi-plaza-unpublished', syncPublished);
      window.removeEventListener('storage', syncPublished);
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return templates.filter((item) => {
      const matchesPublisher = publisherFilter === 'all'
        || (publisherFilter === 'official' ? item.official : !item.official);
      const matchesKeyword = !keyword || `${item.title}${item.author}${item.description}`.toLowerCase().includes(keyword);
      return matchesPublisher && matchesKeyword;
    });
  }, [publisherFilter, query, templates]);

  const openTemplate = (id: string) => {
    setTemplates((items) => items.map((item) => item.id === id ? { ...item, views: item.views + 1 } : item));
    setSelectedId(id);
    onDetailChange?.(true);
  };

  const openAuthor = (author: string) => {
    setSelectedAuthor(author);
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.set('author', author);
    window.history.replaceState(null, '', url);
    onDetailChange?.(true);
  };

  const toggleLike = (id: string) => {
    const alreadyLiked = likedIds.includes(id);
    setLikedIds((ids) => alreadyLiked ? ids.filter((likedId) => likedId !== id) : [...ids, id]);
    setTemplates((items) => items.map((item) => item.id === id
      ? { ...item, likes: Math.max(0, item.likes + (alreadyLiked ? -1 : 1)) }
      : item));
  };

  if (selected) {
    return (
      <TemplateDetail
        template={selected}
        liked={likedIds.includes(selected.id)}
        onBack={() => {
          setSelectedId(null);
          onDetailChange?.(Boolean(selectedAuthor));
        }}
        onOpenAuthor={() => openAuthor(selected.author)}
        onToggleLike={() => toggleLike(selected.id)}
        onUse={selected.isTemplate !== false ? () => onUseTemplate({
          id: selected.id,
          title: selected.title,
          author: selected.author,
          category: selected.category,
          description: selected.description,
          sourceUrl: selected.sourceUrl,
          supportedDevices: selected.supportedDevices,
          tools: selected.tools,
        }) : undefined}
      />
    );
  }

  if (selectedAuthor) {
    return (
      <AuthorProfile
        author={selectedAuthor}
        templates={templates.filter((template) => template.author === selectedAuthor)}
        likedIds={likedIds}
        onBack={() => {
          setSelectedAuthor(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('author');
          window.history.replaceState(null, '', url);
          onDetailChange?.(false);
        }}
        onOpenTemplate={openTemplate}
        onToggleLike={toggleLike}
      />
    );
  }

  return (
    <main className="min-h-full px-8 py-8 animate-fade-in">
      <div className="mx-auto max-w-[1180px]">
        <header>
          <h1 className="text-[30px] font-bold tracking-tight text-bolt-light-12">应用广场</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-bolt-light-8">
            发现盈米与社区用户发布的金融应用；标记为模板的应用还可以继续创建。
          </p>
        </header>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-b border-bolt-light-5">
          <div className="flex items-center gap-1" role="tablist" aria-label="应用发布者分类">
            {publisherTabs.map((tab) => {
              const Icon = tab.icon;
              const active = publisherFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPublisherFilter(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-[14px] font-medium transition-colors ${active ? 'text-bolt-blue' : 'text-bolt-light-8 hover:text-bolt-light-11'}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-bolt-blue" />}
                </button>
              );
            })}
          </div>
          <label className="relative mb-2 block w-full shrink-0 md:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bolt-light-7" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索应用或作者"
              className="h-10 w-full rounded-xl border border-bolt-light-5 bg-white pl-9 pr-3 text-[13px] text-bolt-light-12 outline-none transition placeholder:text-bolt-light-7 focus:border-bolt-blue"
            />
          </label>
        </div>

        {filtered.length ? (
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-8 lg:grid-cols-2">
            {filtered.map((item) => (
              <article key={item.id} className="group min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    openTemplate(item.id);
                  }}
                  className="block w-full overflow-hidden rounded-2xl border border-bolt-light-5 bg-bolt-light-2 text-left shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-bolt-light-6 group-hover:shadow-md"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-white">
                    <ApplicationFirstScreen template={item} thumbnail />
                  </div>
                </button>
                <div className="mt-3 flex items-start justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[16px] font-semibold text-bolt-light-12">{item.title}</h2>
                      <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-bolt-blue">{item.category}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[12.5px] text-bolt-light-8">
                      <span>by</span>
                      <button type="button" onClick={() => openAuthor(item.author)} className="transition hover:text-bolt-blue hover:underline">{item.author}</button>
                      {item.official && <BadgeCheck className="h-3.5 w-3.5 text-bolt-blue" aria-label="盈米官方" />}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLike(item.id)}
                    aria-pressed={likedIds.includes(item.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] transition hover:bg-red-50 hover:text-bolt-red ${likedIds.includes(item.id) ? 'text-bolt-red' : 'text-bolt-light-7'}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${likedIds.includes(item.id) ? 'fill-current text-bolt-red' : ''}`} /> {formatCount(item.likes)}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <Search className="h-8 w-8 text-bolt-light-6" />
            <p className="mt-3 text-[14px] font-medium text-bolt-light-10">没有找到匹配的应用</p>
            <button type="button" onClick={() => setQuery('')} className="mt-2 text-[13px] text-bolt-blue hover:underline">清除搜索</button>
          </div>
        )}
      </div>
    </main>
  );
}

const AUTHOR_PROFILES: Record<string, { bio: string; following: number; followers: number }> = {
  王钊灏: { bio: '专注于 QDII 基金筛选、额度管理与指数投资工具，让复杂的基金选择更简单。', following: 18, followers: 286 },
  盈米研究团队: { bio: '围绕基金研究、组合分析与金融数据可视化，持续发布可复用的专业应用。', following: 12, followers: 1240 },
  林小满: { bio: '关注家庭资产配置与组合风险，用直观的产品帮助用户理解自己的投资。', following: 31, followers: 194 },
  盈米内容实验室: { bio: '探索 AI 在金融内容生产与市场解读中的应用方式。', following: 8, followers: 826 },
  周予安: { bio: '专注家庭财富规划、长期目标管理与资产配置体验。', following: 24, followers: 168 },
};

function AuthorProfile({
  author,
  templates,
  likedIds,
  onBack,
  onOpenTemplate,
  onToggleLike,
}: {
  author: string;
  templates: PlazaTemplate[];
  likedIds: string[];
  onBack: () => void;
  onOpenTemplate: (id: string) => void;
  onToggleLike: (id: string) => void;
}) {
  const [followed, setFollowed] = useState(false);
  const [shared, setShared] = useState(false);
  const profile = AUTHOR_PROFILES[author] ?? { bio: '该用户还没有填写个人简介。', following: 0, followers: 0 };
  const totalLikes = templates.reduce((sum, template) => sum + template.likes, 0);
  const official = templates.some((template) => template.official);

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // 浏览器不允许访问剪贴板时，仍展示轻量成功反馈，避免阻断演示流程。
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1600);
  };

  return (
    <main className="min-h-full px-6 py-8 animate-fade-in sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[13px] font-medium text-bolt-light-8 transition hover:text-bolt-light-12">
          <ArrowLeft className="h-4 w-4" /> 返回应用广场
        </button>

        <section className="mt-8 flex flex-col gap-6 border-b border-bolt-light-5 pb-9 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-bolt-blue-light text-bolt-blue ring-1 ring-bolt-blue/10">
              <UserRound className="h-9 w-9" />
            </div>
            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-[24px] font-bold tracking-tight text-bolt-light-12">{author}</h1>
                {official && <BadgeCheck className="h-5 w-5 text-bolt-blue" aria-label="盈米官方" />}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] text-bolt-light-8">
                <span>关注 <strong className="ml-1 font-semibold text-bolt-light-11">{profile.following}</strong></span>
                <span>粉丝 <strong className="ml-1 font-semibold text-bolt-light-11">{profile.followers + (followed ? 1 : 0)}</strong></span>
                <span>获赞 <strong className="ml-1 font-semibold text-bolt-light-11">{formatCount(totalLikes)}</strong></span>
              </div>
              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-bolt-light-8">{profile.bio}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 md:pt-1">
            <button type="button" onClick={() => setFollowed((value) => !value)} className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-semibold transition ${followed ? 'border border-bolt-light-5 bg-white text-bolt-light-10 hover:bg-bolt-light-2' : 'bg-bolt-blue text-white hover:brightness-95'}`}>
              <UserPlus className="h-4 w-4" /> {followed ? '已关注' : '关注'}
            </button>
            <button type="button" onClick={shareProfile} className="inline-flex h-10 items-center gap-2 rounded-xl border border-bolt-light-5 bg-white px-4 text-[13px] font-medium text-bolt-light-10 transition hover:bg-bolt-light-2">
              <Share2 className="h-4 w-4" /> {shared ? '已复制链接' : '分享主页'}
            </button>
          </div>
        </section>

        <section className="pt-8">
          <div>
            <h2 className="text-[20px] font-bold text-bolt-light-12">作品</h2>
            <p className="mt-1 text-[12.5px] text-bolt-light-7">共 {templates.length} 个作品</p>
          </div>

          {templates.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {templates.map((template) => (
                <article key={template.id} className="group min-w-0">
                  <button type="button" onClick={() => onOpenTemplate(template.id)} className="block w-full overflow-hidden rounded-2xl border border-bolt-light-5 bg-bolt-light-2 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-bolt-light-6 hover:shadow-md">
                    <div className="aspect-[16/9] overflow-hidden bg-white">
                      <ApplicationFirstScreen template={template} thumbnail />
                    </div>
                  </button>
                  <div className="mt-3 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold text-bolt-light-12">{template.title}</h3>
                      <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-bolt-blue">{template.category}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-4 text-[11px] text-bolt-light-7">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatCount(template.views)}</span>
                      <button type="button" onClick={() => onToggleLike(template.id)} aria-pressed={likedIds.includes(template.id)} className={`inline-flex items-center gap-1 transition hover:text-bolt-red ${likedIds.includes(template.id) ? 'text-bolt-red' : ''}`}>
                        <Heart className={`h-3.5 w-3.5 ${likedIds.includes(template.id) ? 'fill-current' : ''}`} /> {formatCount(template.likes)}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-bolt-light-6 px-6 py-16 text-center text-[13px] text-bolt-light-7">暂无作品</div>
          )}
        </section>
      </div>
    </main>
  );
}

function TemplateDetail({
  template,
  liked,
  onBack,
  onOpenAuthor,
  onUse,
  onToggleLike,
}: {
  template: PlazaTemplate;
  liked: boolean;
  onBack: () => void;
  onOpenAuthor: () => void;
  onUse?: () => void;
  onToggleLike: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [descriptionOverflow, setDescriptionOverflow] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [activeTool, setActiveTool] = useState<ToolKind>('MCP');
  const [followed, setFollowed] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  useLayoutEffect(() => {
    const description = descriptionRef.current;
    if (!description) return;

    setExpanded(false);
    const measureOverflow = () => {
      const lineHeight = Number.parseFloat(window.getComputedStyle(description).lineHeight);
      setDescriptionOverflow(description.scrollHeight > lineHeight * 2 + 1);
    };

    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(description);
    return () => observer.disconnect();
  }, [template.description]);

  return (
    <main className="min-h-full px-8 py-10 animate-fade-in">
      <div className="mx-auto grid min-h-[calc(100vh-136px)] max-w-[1440px] lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
          <aside className="flex flex-col border-b border-bolt-light-4 p-6 lg:border-b-0 lg:border-r lg:p-8">
            <button type="button" onClick={onBack} className="mb-8 inline-flex w-fit items-center gap-2 text-[13px] font-medium text-bolt-light-8 transition hover:text-bolt-light-12">
              <ArrowLeft className="h-4 w-4" /> 返回应用广场
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-[28px] font-semibold tracking-tight text-bolt-light-12" title={template.title}>{template.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-bolt-light-8">
                <span>by</span>
                <button type="button" onClick={onOpenAuthor} className="inline-flex items-center gap-1.5 transition hover:text-bolt-blue hover:underline">
                  {template.author}
                  {template.official && <BadgeCheck className="h-4 w-4 text-bolt-blue" />}
                </button>
                <button type="button" onClick={() => setFollowed((value) => !value)} className={`shrink-0 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition ${followed ? 'bg-blue-50 text-bolt-blue' : 'bg-bolt-blue text-white'}`}>
                  {followed ? '已关注' : '+ 关注'}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p ref={descriptionRef} className={`text-[14px] leading-7 text-bolt-light-10 ${expanded ? '' : 'line-clamp-2'}`}>{template.description}</p>
              {descriptionOverflow && (
                <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-bolt-light-8 hover:text-bolt-blue">
                  {expanded ? <>收起 <ChevronUp className="h-3.5 w-3.5" /></> : <>展开 <ChevronDown className="h-3.5 w-3.5" /></>}
                </button>
              )}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4 border-b border-bolt-light-4 pb-7 text-[12px] text-bolt-light-8">
              <button type="button" onClick={onToggleLike} aria-pressed={liked} className={`inline-flex items-center gap-1.5 transition hover:text-bolt-red ${liked ? 'text-bolt-red' : ''}`}>
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {formatCount(template.likes)}
              </button>
              {template.sourceUrl && (
                <a href={template.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-bolt-blue" title="访问原应用">
                  <Compass className="h-4 w-4" /> 访问
                </a>
              )}
              <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {formatCount(template.views)}</span>
              {onUse && (
                <button
                  type="button"
                  onClick={onUse}
                  className="inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-bolt-blue px-3 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-95"
                >
                  <Sparkles className="h-3.5 w-3.5" /> 使用模板
                </button>
              )}
            </div>

            <div className="mt-7">
              <h2 className="text-[16px] font-semibold text-bolt-light-12">使用的盈米工具</h2>
              <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-bolt-light-2 p-1">
                {toolTabs.map(({ id, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setActiveTool(id)} className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[11.5px] font-medium transition ${activeTool === id ? 'bg-white text-bolt-blue shadow-sm' : 'text-bolt-light-8 hover:text-bolt-light-11'}`}>
                    <Icon className="h-3.5 w-3.5" /> {id}
                  </button>
                ))}
              </div>
              <div className="mt-4 divide-y divide-bolt-light-4 overflow-hidden rounded-xl border border-bolt-light-4 bg-white">
                {template.tools[activeTool].length === 0 ? (
                  <div className="px-4 py-5 text-center text-[11.5px] text-bolt-light-7">该应用未使用{activeTool}</div>
                ) : template.tools[activeTool].map((tool) => (
                  <div key={tool} className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12.5px] font-semibold text-bolt-light-11">{tool}</span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10.5px] font-medium text-bolt-blue">
                        {getToolCategory(activeTool, tool)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11.5px] leading-5 text-bolt-light-7">{getToolDescription(activeTool, tool)}</p>
                  </div>
                ))}
              </div>
            </div>

          </aside>

          <div className="min-w-0 bg-[#f6f7f9]">
            <div className="p-5 lg:p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-bolt-light-12">应用预览</h2>
                  <p className="mt-1 text-[11.5px] text-bolt-light-7">可以在预览中直接点击和体验应用</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-xl border border-bolt-light-5 bg-white p-1 shadow-sm" role="group" aria-label="预览设备">
                    <button
                      type="button"
                      disabled={!template.supportedDevices.includes('desktop')}
                      onClick={() => setPreviewMode('desktop')}
                      title={template.supportedDevices.includes('desktop') ? '查看 PC 版' : '该应用未提供 PC 版'}
                      aria-label={template.supportedDevices.includes('desktop') ? '查看 PC 版' : '该应用未提供 PC 版'}
                      aria-pressed={previewMode === 'desktop'}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 ${previewMode === 'desktop' ? 'bg-bolt-light-3 text-bolt-light-12' : 'text-bolt-light-7 hover:text-bolt-light-11'}`}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={!template.supportedDevices.includes('mobile')}
                      onClick={() => setPreviewMode('mobile')}
                      title={template.supportedDevices.includes('mobile') ? '查看手机版' : '该应用未提供手机版'}
                      aria-label={template.supportedDevices.includes('mobile') ? '查看手机版' : '该应用未提供手机版'}
                      aria-pressed={previewMode === 'mobile'}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-35 ${previewMode === 'mobile' ? 'bg-bolt-light-3 text-bolt-light-12' : 'text-bolt-light-7 hover:text-bolt-light-11'}`}
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex min-h-[620px] items-start justify-center overflow-auto rounded-2xl border border-bolt-light-5 bg-[#e9ebef] p-3 shadow-inner lg:p-5">
                <div className={`overflow-hidden bg-white shadow-xl transition-[width,border-radius] duration-300 ${previewMode === 'mobile' ? 'w-[390px] max-w-full rounded-[28px] border-[8px] border-bolt-light-12' : 'w-full rounded-xl border border-bolt-light-5'}`}>
                  <ApplicationFirstScreen template={template} compact={previewMode === 'mobile'} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11.5px] text-bolt-light-7">
                <span>预览数据仅用于演示；PC 与手机版共享相同功能</span>
                <span>{template.category}</span>
              </div>
            </div>
          </div>
      </div>
    </main>
  );
}

function ApplicationFirstScreen({
  template,
  compact = false,
  thumbnail = false,
}: {
  template: PlazaTemplate;
  compact?: boolean;
  thumbnail?: boolean;
}) {
  if (template.sourceUrl) {
    return (
      <div className={thumbnail ? 'pointer-events-none h-full w-full origin-top-left overflow-hidden' : 'h-[720px] w-full'}>
        <iframe
          src={template.sourceUrl}
          title={`${template.title}${thumbnail ? '首页缩略图' : '应用预览'}`}
          className={thumbnail ? 'h-[720px] w-full border-0 bg-white' : 'h-full w-full border-0 bg-white'}
          style={thumbnail ? { transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' } : undefined}
          tabIndex={thumbnail ? -1 : 0}
          sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        />
      </div>
    );
  }

  if (thumbnail) {
    return (
      <div className="pointer-events-none h-full w-full overflow-hidden">
        <div className="h-[720px] w-[1280px] origin-top-left" style={{ transform: 'scale(0.43)' }}>
          <InteractiveTemplatePreview template={template} compact={false} />
        </div>
      </div>
    );
  }

  return <InteractiveTemplatePreview template={template} compact={compact} />;
}

export function CopiedApplicationPreview({ template }: { template: CopiedApplicationTemplate }) {
  const previewTemplate: PlazaTemplate = {
    ...template,
    cover: '',
    likes: 0,
    views: 0,
    isTemplate: true,
  };
  return <ApplicationFirstScreen template={previewTemplate} />;
}

function InteractiveTemplatePreview({
  template,
  compact,
}: {
  template: PlazaTemplate;
  compact: boolean;
}) {
  const [activePanel, setActivePanel] = useState<'overview' | 'analysis' | 'tools'>('overview');
  const [analysisReady, setAnalysisReady] = useState(false);
  const [subject, setSubject] = useState('');
  const [riskLevel, setRiskLevel] = useState('均衡');
  const [rangeValue, setRangeValue] = useState(3);
  const [selectedResult, setSelectedResult] = useState(0);
  const accentButton = 'bg-bolt-blue';
  const accentText = 'text-bolt-blue';

  const previewConfig = useMemo(() => {
    if (template.category === '组合诊断') return {
      eyebrow: 'PORTFOLIO HEALTH',
      title: '组合健康检查',
      subjectLabel: '基金组合',
      placeholder: '输入基金名称，用逗号分隔',
      rangeLabel: '持仓基金数量',
      rangeUnit: '只',
      action: '开始诊断',
      metrics: ['组合健康度', '集中度', '相关性风险', '风险提示'],
      rows: ['资产配置均衡度', '基金持仓重叠', '收益相关性', '历史回撤水平'],
    };
    if (template.category === '市场内容') return {
      eyebrow: 'MARKET BRIEF',
      title: '生成今日市场早报',
      subjectLabel: '关注主题',
      placeholder: '例如：A股、债券、海外市场',
      rangeLabel: '早报模块数量',
      rangeUnit: '个',
      action: '生成早报',
      metrics: ['市场温度', '重要事件', '上涨行业', '风险关注'],
      rows: ['市场概览', '核心事件', '行业表现', '今日关注'],
    };
    if (template.category === '财富规划') return {
      eyebrow: 'WEALTH PLAN',
      title: '测算家庭财富目标',
      subjectLabel: '财富目标',
      placeholder: '例如：10年后准备300万元养老资金',
      rangeLabel: '规划期限',
      rangeUnit: '年',
      action: '开始测算',
      metrics: ['目标达成率', '资金缺口', '建议月投入', '风险等级'],
      rows: ['家庭现金流', '保障准备', '目标进度', '资产配置'],
    };
    return {
      eyebrow: 'FUND RESEARCH',
      title: '创建基金研究任务',
      subjectLabel: '研究对象',
      placeholder: '输入基金名称或代码',
      rangeLabel: '对比基金数量',
      rangeUnit: '只',
      action: '生成研究',
      metrics: ['候选基金', '近一年收益', '最大回撤', '综合评分'],
      rows: ['业绩表现', '风险收益', '持仓结构', '基金经理'],
    };
  }, [template.category]);

  const metricValues = useMemo(() => {
    if (template.category === '市场内容') return [`${62 + rangeValue}`, `${rangeValue + 2} 条`, `${rangeValue + 1} 个`, `${Math.max(1, 5 - rangeValue)} 项`];
    if (template.category === '财富规划') return [`${68 + rangeValue * 3}%`, `${Math.max(18, 92 - rangeValue * 7)} 万`, `${3600 + rangeValue * 420} 元`, riskLevel];
    if (template.category === '组合诊断') return [`${76 + rangeValue * 2} / 100`, `${34 + rangeValue}%`, riskLevel === '稳健' ? '较低' : riskLevel === '进取' ? '较高' : '中等', `${Math.max(1, 6 - rangeValue)} 项`];
    return [`${rangeValue * 4 + 9} 只`, `+${(6.2 + rangeValue * 0.7).toFixed(1)}%`, `-${(4.8 + rangeValue * 0.5).toFixed(1)}%`, `${78 + rangeValue * 2}`];
  }, [rangeValue, riskLevel, template.category]);

  const runAnalysis = () => {
    setAnalysisReady(true);
    setActivePanel('analysis');
  };

  return (
    <div className="min-h-[720px] bg-white">
      <header className={`flex items-center justify-between border-b border-bolt-light-4 ${compact ? 'px-4 py-3' : 'px-7 py-4'}`}>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-bolt-light-12">{template.title}</h3>
          {!compact && <p className="mt-0.5 text-[11px] text-bolt-light-7">由 {template.author} 创建</p>}
        </div>
      </header>

      <nav className={`flex gap-1 border-b border-bolt-light-4 ${compact ? 'overflow-x-auto px-3' : 'px-6'}`} aria-label="应用预览导航">
        {([
          ['overview', '应用首页'],
          ['analysis', '分析结果'],
          ['tools', '能力明细'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActivePanel(id)}
            className={`relative whitespace-nowrap px-3 py-3 text-[11.5px] font-medium ${activePanel === id ? accentText : 'text-bolt-light-7 hover:text-bolt-light-11'}`}
          >
            {label}
            {activePanel === id && <span className={`absolute inset-x-2 bottom-0 h-0.5 ${accentButton}`} />}
          </button>
        ))}
      </nav>

      <div className={compact ? 'p-4' : 'p-7'}>
        {activePanel === 'overview' && (
          <div className="space-y-5">
            <section className={`overflow-hidden rounded-2xl bg-gradient-to-br from-[#071d3c] via-[#0b315e] to-[#1268a8] text-white ${compact ? 'p-5' : 'p-8'}`}>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-blue-200">{previewConfig.eyebrow}</p>
              <h4 className={`mt-3 font-semibold ${compact ? 'text-[21px]' : 'text-[28px]'}`}>{previewConfig.title}</h4>
              <p className="mt-2 max-w-xl text-[12px] leading-6 text-blue-100">{template.description}</p>
            </section>

            <section className="rounded-2xl border border-bolt-light-5 bg-white p-5 shadow-sm">
              <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_150px]'}`}>
                <label className="block">
                  <span className="mb-2 block text-[11.5px] font-medium text-bolt-light-9">{previewConfig.subjectLabel}</span>
                  <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder={previewConfig.placeholder} className="h-11 w-full rounded-xl border border-bolt-light-5 px-3 text-[12px] outline-none transition focus:border-bolt-blue" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11.5px] font-medium text-bolt-light-9">风险偏好</span>
                  <select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)} className="h-11 w-full rounded-xl border border-bolt-light-5 bg-white px-3 text-[12px] outline-none focus:border-bolt-blue">
                    <option>稳健</option><option>均衡</option><option>进取</option>
                  </select>
                </label>
              </div>
              <label className="mt-5 block">
                <span className="flex items-center justify-between text-[11.5px] font-medium text-bolt-light-9"><span>{previewConfig.rangeLabel}</span><strong className="text-bolt-blue">{rangeValue}{previewConfig.rangeUnit}</strong></span>
                <input type="range" min="1" max="5" value={rangeValue} onChange={(event) => setRangeValue(Number(event.target.value))} className="mt-3 w-full accent-blue-600" />
              </label>
              <button type="button" onClick={runAnalysis} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-bolt-blue text-[12px] font-semibold text-white transition hover:brightness-95">
                <Sparkles className="h-4 w-4" /> {previewConfig.action}
              </button>
            </section>

            <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {previewConfig.metrics.map((label, index) => (
                <button key={label} type="button" onClick={() => setSelectedResult(index)} className={`rounded-xl border p-4 text-left transition ${selectedResult === index ? 'border-bolt-blue bg-blue-50' : 'border-bolt-light-5 bg-white hover:border-bolt-light-7'}`}>
                  <span className="text-[10.5px] text-bolt-light-7">{label}</span>
                  <strong className="mt-2 block text-[15px] text-bolt-light-12">{metricValues[index]}</strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {activePanel === 'analysis' && (
          <div>
            {!analysisReady ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-bolt-light-6 bg-bolt-light-2 px-6 text-center">
                <BarChart3 className={`h-8 w-8 ${accentText}`} />
                <h4 className="mt-4 text-[15px] font-semibold text-bolt-light-12">准备生成分析结果</h4>
                <p className="mt-2 max-w-sm text-[12px] leading-6 text-bolt-light-7">返回应用首页填写条件后，即可生成本次分析结果。</p>
                <button type="button" onClick={() => setActivePanel('overview')} className={`mt-5 rounded-lg px-4 py-2.5 text-[12px] font-semibold text-white ${accentButton}`}>
                  返回填写条件
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  {previewConfig.metrics.map((label, index) => (
                    <div key={label} className="rounded-xl border border-bolt-light-5 bg-white p-4 shadow-sm">
                      <p className="text-[10.5px] text-bolt-light-7">{label}</p>
                      <p className="mt-2 text-[17px] font-semibold text-bolt-light-12">{metricValues[index]}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-bolt-light-5 p-5">
                  <h4 className="text-[14px] font-semibold text-bolt-light-12">分析摘要</h4>
                  <p className="mt-3 text-[12px] leading-7 text-bolt-light-8">已根据“{subject || previewConfig.placeholder}”、{riskLevel}偏好和{rangeValue}{previewConfig.rangeUnit}参数生成结果。点击下方项目可查看不同分析维度。</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {previewConfig.rows.map((row, index) => (
                      <button key={row} type="button" onClick={() => setSelectedResult(index)} className={`rounded-lg px-3 py-2.5 text-left text-[11.5px] transition ${selectedResult === index ? 'bg-bolt-blue-light font-medium text-bolt-blue' : 'bg-bolt-light-2 text-bolt-light-9 hover:bg-bolt-light-4'}`}>{row}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activePanel === 'tools' && (
          <div className="space-y-5">
            {toolTabs.map(({ id, icon: Icon }) => (
              <section key={id} className="rounded-xl border border-bolt-light-5 p-4">
                <h4 className="flex items-center gap-2 text-[13px] font-semibold text-bolt-light-11"><Icon className={`h-4 w-4 ${accentText}`} /> {id}</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {template.tools[id].length === 0 ? (
                    <span className="text-[11px] text-bolt-light-7">未使用</span>
                  ) : template.tools[id].map((tool) => (
                    <button key={tool} type="button" className="rounded-lg bg-bolt-light-2 px-3 py-2 text-[11px] text-bolt-light-9 transition hover:bg-bolt-light-4">{tool}</button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
