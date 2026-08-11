import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Blocks,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Eye,
  ExternalLink,
  Heart,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react';

type Category = '基金研究' | '组合诊断' | '市场内容' | '财富规划';
type ToolKind = 'MCP' | 'Skills' | 'Agent' | '组件';

interface PlazaTemplate {
  id: string;
  title: string;
  author: string;
  official?: boolean;
  category: Category;
  description: string;
  cover: string;
  likes: number;
  views: string;
  tools: Record<ToolKind, string[]>;
  sourceUrl?: string;
  accent?: 'orange' | 'blue';
}

const toolTabs: { id: ToolKind; icon: typeof Database }[] = [
  { id: 'MCP', icon: Database },
  { id: 'Skills', icon: Sparkles },
  { id: 'Agent', icon: Bot },
  { id: '组件', icon: Blocks },
];

const initialTemplates: PlazaTemplate[] = [
  {
    id: 'nasdaq-butler',
    title: '纳指管家',
    author: '王钊灏',
    category: '基金研究',
    description: '对比 25 只以上纳斯达克 100 基金的费率、实测跟踪误差、限额、规模与赎回速度，并按综合最优、大额定投、跟踪精度等场景辅助选择；还可自定义基金比例，实时计算组合费率、跟踪误差和每日可投额度。',
    cover: '/plaza/nasdaq-butler.svg',
    likes: 0,
    views: '新上线',
    sourceUrl: 'https://qieman.com/mix-pay/nasdaq-butler',
    accent: 'blue',
    tools: {
      MCP: ['基金搜索', '批量获取基金详情', '基金交易限制信息', '基金风险分析'],
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
    views: '3.4K',
    tools: {
      MCP: ['基金代码模糊匹配', '批量获取基金详情', '基金净值历史'],
      Skills: ['fund-analyst', 'design-data-visualization'],
      Agent: ['基金研究 Agent'],
      组件: ['指标卡', '收益曲线', '基金对比表'],
    },
  },
  {
    id: 'portfolio-health',
    title: '组合健康诊断',
    author: '林小满',
    category: '组合诊断',
    description: '从资产配置、相关性和集中度出发，识别组合中的主要风险，并给出易于理解的诊断摘要。',
    cover: '/plaza/portfolio-health.png',
    likes: 286,
    views: '2.1K',
    tools: {
      MCP: ['基金持仓查询', '基金业绩表现'],
      Skills: ['portfolio-doctor', 'risk-insight'],
      Agent: ['组合诊断 Agent'],
      组件: ['健康评分', '相关性热力图', '风险预警'],
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
    views: '2.8K',
    tools: {
      MCP: ['指数行情', '财经新闻', '行业指标'],
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
    views: '1.6K',
    tools: {
      MCP: ['基金筛选', '基金详情'],
      Skills: ['wealth-planner', 'report-designer'],
      Agent: ['家庭财富 Agent'],
      组件: ['现金流图', '目标进度', '配置建议'],
    },
  },
];

interface PlazaPageProps {
  onUseTemplate: (prompt: string) => void;
  onDetailChange?: (open: boolean) => void;
}

export default function PlazaPage({ onUseTemplate, onDetailChange }: PlazaPageProps) {
  const [selected, setSelected] = useState<PlazaTemplate | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return initialTemplates.filter((item) =>
      !keyword || `${item.title}${item.author}${item.description}`.toLowerCase().includes(keyword)
    );
  }, [query]);

  if (selected) {
    return (
      <TemplateDetail
        template={selected}
        onBack={() => {
          setSelected(null);
          onDetailChange?.(false);
        }}
        onUse={() => onUseTemplate(`请使用「${selected.title}」模板，基于我的需求创建一个金融应用。保留模板的信息架构与可视化方式，并先向我确认需要替换的数据和内容。`)}
      />
    );
  }

  return (
    <main className="min-h-full px-8 py-10 animate-fade-in">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-bolt-light-12">应用广场</h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-bolt-light-8">
              发现盈米与社区用户发布的金融应用模板，找到灵感后即可继续创建。
            </p>
          </div>
          <label className="relative block w-full shrink-0 md:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bolt-light-7" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索模板或作者"
              className="h-10 w-full rounded-xl border border-bolt-light-5 bg-white pl-9 pr-3 text-[13px] text-bolt-light-12 outline-none transition placeholder:text-bolt-light-7 focus:border-bolt-orange"
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
                    setSelected(item);
                    onDetailChange?.(true);
                  }}
                  className="block w-full overflow-hidden rounded-2xl border border-bolt-light-5 bg-bolt-light-2 text-left shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-bolt-light-6 group-hover:shadow-md"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-bolt-light-3">
                    <img src={item.cover} alt={`${item.title}模板预览`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]" />
                  </div>
                </button>
                <div className="mt-3 flex items-start justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[16px] font-semibold text-bolt-light-12">{item.title}</h2>
                      <span className="shrink-0 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-bolt-orange">{item.category}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[12.5px] text-bolt-light-8">
                      by {item.author}
                      {item.official && <BadgeCheck className="h-3.5 w-3.5 text-bolt-orange" aria-label="盈米官方" />}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[11px] text-bolt-light-7">
                    <Heart className="h-3.5 w-3.5" /> {item.likes}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <Search className="h-8 w-8 text-bolt-light-6" />
            <p className="mt-3 text-[14px] font-medium text-bolt-light-10">没有找到匹配的模板</p>
            <button type="button" onClick={() => setQuery('')} className="mt-2 text-[13px] text-bolt-blue hover:underline">清除搜索</button>
          </div>
        )}
      </div>
    </main>
  );
}

function TemplateDetail({ template, onBack, onUse }: { template: PlazaTemplate; onBack: () => void; onUse: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [descriptionOverflow, setDescriptionOverflow] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [activeTool, setActiveTool] = useState<ToolKind>('MCP');
  const [followed, setFollowed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const useBlueAccent = template.accent === 'blue';

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

  const share = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
    } finally {
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    }
  };

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
                <span className="inline-flex items-center gap-1.5">
                  by {template.author}
                  {template.official && <BadgeCheck className="h-4 w-4 text-bolt-orange" />}
                </span>
                <button type="button" onClick={() => setFollowed((value) => !value)} className={`shrink-0 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition ${useBlueAccent ? (followed ? 'bg-blue-50 text-bolt-blue' : 'bg-bolt-blue text-white') : (followed ? 'bg-orange-50 text-bolt-orange' : 'bg-bolt-orange text-white')}`}>
                  {followed ? '已关注' : '+ 关注'}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p ref={descriptionRef} className={`text-[14px] leading-7 text-bolt-light-10 ${expanded ? '' : 'line-clamp-2'}`}>{template.description}</p>
              {descriptionOverflow && (
                <button type="button" onClick={() => setExpanded((value) => !value)} className={`mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-bolt-light-8 ${useBlueAccent ? 'hover:text-bolt-blue' : 'hover:text-bolt-orange'}`}>
                  {expanded ? <>收起 <ChevronUp className="h-3.5 w-3.5" /></> : <>展开 <ChevronDown className="h-3.5 w-3.5" /></>}
                </button>
              )}
            </div>

            <div className="mt-7 flex items-center gap-5 border-b border-bolt-light-4 pb-7 text-[12px] text-bolt-light-8">
              <button type="button" onClick={() => setLiked((value) => !value)} className={`inline-flex items-center gap-1.5 transition ${useBlueAccent ? 'hover:text-bolt-blue' : 'hover:text-bolt-orange'} ${liked ? (useBlueAccent ? 'text-bolt-blue' : 'text-bolt-orange') : ''}`}>
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {template.likes + (liked ? 1 : 0)}
              </button>
              <button type="button" onClick={share} className={`inline-flex items-center gap-1.5 transition ${useBlueAccent ? 'hover:text-bolt-blue' : 'hover:text-bolt-orange'}`}>
                {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {shared ? '已复制' : '分享'}
              </button>
              <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {template.views}</span>
            </div>

            <div className="mt-7">
              <h2 className="text-[16px] font-semibold text-bolt-light-12">使用的盈米工具</h2>
              <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-bolt-light-2 p-1">
                {toolTabs.map(({ id, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setActiveTool(id)} className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[11.5px] font-medium transition ${activeTool === id ? `bg-white shadow-sm ${useBlueAccent ? 'text-bolt-blue' : 'text-bolt-orange'}` : 'text-bolt-light-8 hover:text-bolt-light-11'}`}>
                    <Icon className="h-3.5 w-3.5" /> {id}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {template.tools[activeTool].map((tool) => (
                  <span key={tool} className="rounded-lg border border-bolt-light-4 bg-bolt-light-2 px-2.5 py-1.5 text-[11.5px] text-bolt-light-9">{tool}</span>
                ))}
              </div>
            </div>

            <button type="button" onClick={onUse} className={`mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-semibold text-white shadow-sm transition hover:brightness-95 lg:mt-auto ${useBlueAccent ? 'bg-bolt-blue' : 'bg-bolt-orange'}`}>
              <Sparkles className="h-4 w-4" /> 使用此模板
            </button>
          </aside>

          <div className="min-w-0 bg-[#f6f7f9]">
            <div className="p-5 lg:p-8">
              <div className="overflow-hidden rounded-2xl border border-bolt-light-5 bg-white shadow-sm">
                <img src={template.cover} alt={`${template.title}完整页面预览`} className="h-auto w-full object-contain" />
              </div>
              <div className="mt-4 flex items-center justify-between text-[11.5px] text-bolt-light-7">
                <span>页面内容为模板演示，数据仅用于展示</span>
                <div className="flex items-center gap-4">
                  <span>{template.category}</span>
                  {template.sourceUrl && (
                    <a href={template.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-bolt-blue hover:underline">
                      查看原应用 <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
    </main>
  );
}
