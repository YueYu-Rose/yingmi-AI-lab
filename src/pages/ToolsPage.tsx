import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar as RechartsRadar,
  RadarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Database,
  ExternalLink,
  FileChartColumn,
  Info,
  LineChart,
  ListChecks,
  PanelsTopLeft,
  PieChart,
  Plus,
  PlugZap,
  Radar,
  RotateCw,
  Search,
  Table2,
  Trash2,
  TrendingUp,
  Workflow,
  X,
} from 'lucide-react';

const MCP_LIST_URL = '/mcp/盈米MCP_统一可分享版.html#tools/all';

const TABS = [
  { id: 'mcp', label: 'MCP', icon: PlugZap },
  { id: 'skills', label: 'Skills', icon: Workflow },
  { id: 'agent', label: 'Agent', icon: Bot },
  { id: 'components', label: '组件', icon: PanelsTopLeft },
] as const;

type CapabilityTab = (typeof TABS)[number]['id'];

interface CapabilityItem {
  id: string;
  name: string;
  description: string;
  meta: string;
  icon: typeof Database;
  accent: string;
}

interface CustomMcp {
  id: string;
  name: string;
  description: string;
  tools: string[];
  enabled: boolean;
  icon: typeof Database;
  accent: string;
}

interface CustomSkill {
  id: string;
  name: string;
  source: string;
  abilities: string[];
  enabled: boolean;
}

const CAPABILITIES: Record<Exclude<CapabilityTab, 'mcp'>, CapabilityItem[]> = {
  skills: [
    {
      id: 'fund-analyst',
      name: 'fund-analyst',
      description: '完成基金筛选、业绩归因、风险比较与结论组织。',
      meta: '基金研究 · 官方 Skill',
      icon: TrendingUp,
      accent: 'bg-violet-50 text-violet-600',
    },
    {
      id: 'design-data-visualization',
      name: 'design-data-visualization',
      description: '将金融数据转换为清晰、可解释的图表与页面。',
      meta: '数据可视化 · 官方 Skill',
      icon: BarChart3,
      accent: 'bg-blue-50 text-blue-600',
    },
  ],
  agent: [
    {
      id: 'fund-research-agent',
      name: '基金研究助手',
      description: '自动规划基金研究步骤，并按需调用 MCP 与 Skills。',
      meta: '研究分析 · 官方 Agent',
      icon: Bot,
      accent: 'bg-cyan-50 text-cyan-700',
    },
    {
      id: 'portfolio-agent',
      name: '组合诊断助手',
      description: '分析持仓结构、风险暴露、相关性与优化方向。',
      meta: '组合诊断 · 官方 Agent',
      icon: CircleCheck,
      accent: 'bg-emerald-50 text-emerald-700',
    },
  ],
  components: [
    {
      id: 'conclusion-card',
      name: '数据结论卡片',
      description: '组合关键结论、核心数据与辅助说明，支持数据、结论和对比三类内容。',
      meta: '信息卡片 · 且慢 Design Skill',
      icon: ListChecks,
      accent: 'bg-blue-50 text-[#1B88EE]',
    },
    {
      id: 'status-callout',
      name: '三态重点提示',
      description: '用成功、提醒和警示三种状态呈现关键结论，并保持风险信息始终可见。',
      meta: '重点提示 · 且慢 Design Skill',
      icon: Info,
      accent: 'bg-amber-50 text-[#EA9500]',
    },
    {
      id: 'financial-data-table',
      name: '金融数据表格',
      description: '采用轻网格线、分组表头和隔行底色，文本左对齐、数字右对齐。',
      meta: '数据表格 · 且慢 Design Skill',
      icon: Table2,
      accent: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'return-line-chart',
      name: '收益曲线',
      description: '展示产品或组合的区间收益走势，仅标注期末、峰值与谷值等关键数据点。',
      meta: '折线图 · 且慢 Design Skill',
      icon: LineChart,
      accent: 'bg-sky-50 text-[#69B1F4]',
    },
    {
      id: 'drawdown-area-chart',
      name: '回撤曲线',
      description: '以负值面积曲线展示回撤变化，突出零线并控制面积透明度。',
      meta: '面积图 · 且慢 Design Skill',
      icon: TrendingUp,
      accent: 'bg-rose-50 text-[#F88D72]',
    },
    {
      id: 'asset-allocation-donut',
      name: '资产配置环形图',
      description: '展示不超过六类资产的配置占比，其余类别统一归入“其他”。',
      meta: '环形图 · 且慢 Design Skill',
      icon: PieChart,
      accent: 'bg-emerald-50 text-[#7DD4C4]',
    },
    {
      id: 'metric-comparison-bar',
      name: '指标对比条形图',
      description: '对比不超过八个类目的指标，仅突出最大值、最小值或期末值。',
      meta: '分组条形图 · 且慢 Design Skill',
      icon: BarChart3,
      accent: 'bg-amber-50 text-[#FBCA74]',
    },
    {
      id: 'allocation-stacked-bar',
      name: '结构占比堆叠图',
      description: '呈现资产或行业占比随时间的变化，并统一图例与百分比口径。',
      meta: '堆叠条形图 · 且慢 Design Skill',
      icon: FileChartColumn,
      accent: 'bg-cyan-50 text-[#68E0F3]',
    },
    {
      id: 'persona-radar-chart',
      name: '用户画像雷达图',
      description: '使用五至七个同口径维度刻画风险偏好或投资画像。',
      meta: '雷达图 · 且慢 Design Skill',
      icon: Radar,
      accent: 'bg-violet-50 text-[#ADAFE8]',
    },
  ],
};

const INITIAL_CUSTOM_MCPS: CustomMcp[] = [
  {
    id: 'hexin-market',
    name: 'hexin-market-mcp',
    description: '提供行情、财务、资讯等数据服务。',
    tools: [
      'hexin-market-mcp_realtime_quote',
      'hexin-market-mcp_fund_market_data',
      'hexin-market-mcp_financial_data',
      'hexin-market-mcp_finance_news',
    ],
    enabled: true,
    icon: TrendingUp,
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'enterprise-research',
    name: 'enterprise-research-mcp',
    description: '连接企业研究资料与内部数据源。',
    tools: [
      'enterprise-research-mcp_report_search',
      'enterprise-research-mcp_company_profile',
      'enterprise-research-mcp_internal_insights',
    ],
    enabled: false,
    icon: BarChart3,
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'internal-knowledge',
    name: 'internal-knowledge-mcp',
    description: '检索团队文档、制度与沉淀内容。',
    tools: [
      'internal-knowledge-mcp_search',
      'internal-knowledge-mcp_document_summary',
      'internal-knowledge-mcp_policy_qa',
    ],
    enabled: false,
    icon: BookOpen,
    accent: 'bg-violet-50 text-violet-600',
  },
];

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<CapabilityTab>('mcp');
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [customMcps, setCustomMcps] = useState<CustomMcp[]>(INITIAL_CUSTOM_MCPS);
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([]);

  useEffect(() => setSearch(''), [activeTab]);

  return (
    <main className="min-h-full px-8 py-8 animate-fade-in">
      <div className="mx-auto max-w-[1180px]">
        <header>
          <h1 className="text-[30px] font-bold tracking-tight text-bolt-light-12">能力中心</h1>
          <p className="mt-2 text-[14px] text-bolt-light-8">
            集中浏览平台能力与组件示例，实际可用状态以接入配置为准。
          </p>
        </header>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-b border-bolt-light-5">
          <div className="flex items-center gap-1" role="tablist" aria-label="能力类型">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-[14px] font-medium transition-colors ${
                    active ? 'text-bolt-blue' : 'text-bolt-light-8 hover:text-bolt-light-11'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-bolt-blue" />}
                </button>
              );
            })}
          </div>

          <div className="mb-2 flex items-center">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bolt-light-7" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={activeTab === 'mcp' ? '搜索官方与自定义MCP' : `搜索${TABS.find((tab) => tab.id === activeTab)?.label}能力`}
                className="h-10 w-[280px] rounded-xl border border-bolt-light-5 bg-white pl-9 pr-3 text-[13px] text-bolt-light-11 outline-none transition focus:border-bolt-blue"
              />
            </label>
          </div>
        </div>

        {activeTab === 'mcp' ? (
          <McpCapabilityView
            search={search}
            customMcps={customMcps}
            onChange={setCustomMcps}
            onAddCustom={() => setAddModalOpen(true)}
          />
        ) : activeTab === 'skills' ? (
          <SkillsCapabilityView
            search={search}
            customSkills={customSkills}
            onChange={setCustomSkills}
            onAddCustom={() => setAddSkillModalOpen(true)}
          />
        ) : (
          <OfficialCapabilityList activeTab={activeTab} search={search} />
        )}
      </div>

      {addModalOpen && (
        <AddCustomMcpModal
          onSave={(item) => setCustomMcps((items) => [...items, item])}
          onClose={() => setAddModalOpen(false)}
        />
      )}
      {addSkillModalOpen && (
        <AddCustomSkillModal
          onSave={(item) => setCustomSkills((items) => [...items, item])}
          onClose={() => setAddSkillModalOpen(false)}
        />
      )}
    </main>
  );
}

function McpCapabilityView({
  search,
  customMcps,
  onChange,
  onAddCustom,
}: {
  search: string;
  customMcps: CustomMcp[];
  onChange: Dispatch<SetStateAction<CustomMcp[]>>;
  onAddCustom: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const query = search.trim().toLowerCase();
  const officialMatches = ['盈米 mcp', '金融数据', '基金研究', '投顾服务', '官方', '平台内置']
    .some((keyword) => keyword.includes(query));
  const filteredCustom = customMcps.filter((item) =>
    [item.name, item.description, ...item.tools].some((value) => value.toLowerCase().includes(query)),
  );

  const toggleMcp = (id: string) => {
    const target = customMcps.find((item) => item.id === id);
    if (!target || loadingIds.includes(id)) return;

    if (target.enabled) {
      if (expanded === id) setExpanded(null);
      onChange((items) => items.map((item) => item.id === id ? { ...item, enabled: false } : item));
      return;
    }

    setLoadingIds((ids) => [...ids, id]);
    window.setTimeout(() => {
      onChange((items) => items.map((item) => item.id === id ? { ...item, enabled: true } : item));
      setLoadingIds((ids) => ids.filter((loadingId) => loadingId !== id));
    }, 900);
  };

  const refreshMcp = (id: string) => {
    if (loadingIds.includes(id)) return;
    setLoadingIds((ids) => [...ids, id]);
    window.setTimeout(() => {
      setLoadingIds((ids) => ids.filter((loadingId) => loadingId !== id));
    }, 900);
  };

  const deleteMcp = (id: string, name: string) => {
    if (!window.confirm(`确定删除自定义 MCP「${name}」吗？删除后需要重新添加才能使用。`)) return;
    if (expanded === id) setExpanded(null);
    setLoadingIds((ids) => ids.filter((loadingId) => loadingId !== id));
    onChange((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="mt-8 space-y-8">
      {officialMatches && <section>
        <h2 className="text-[16px] font-semibold text-bolt-light-11">平台内置能力</h2>
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-bolt-light-5 bg-white px-5 py-5 transition hover:border-bolt-blue/40">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bolt-blue text-white">
            <PlugZap className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[17px] font-semibold text-bolt-light-12">盈米 MCP</h3>
              <span className="rounded-md bg-bolt-blue-light px-2 py-1 text-[11px] font-semibold text-bolt-blue">自动调用</span>
            </div>
            <p className="mt-1.5 text-[13px] text-bolt-light-8">覆盖金融数据、基金研究、投顾服务等核心能力，助力金融场景智能化。</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-bolt-light-8">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              可用
            </span>
          </div>
          <a
            href={MCP_LIST_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-bolt-blue hover:bg-bolt-blue-light"
          >
            查看工具目录（69）
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-bolt-light-11">我的扩展能力</h2>
            <p className="mt-1 text-[12px] text-bolt-light-7">在这里直接开启或暂停智能体的调用权限；连接不会被删除。</p>
          </div>
          <button
            type="button"
            onClick={onAddCustom}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-bolt-blue bg-white px-4 text-[13px] font-semibold text-bolt-blue transition hover:bg-bolt-blue-light"
          >
            <Plus className="h-4 w-4" />
            添加自定义 MCP
          </button>
        </div>

        {filteredCustom.length > 0 ? (
          <div className="mt-4 divide-y divide-bolt-light-5 overflow-hidden rounded-xl border border-bolt-light-5 bg-white">
            {filteredCustom.map((item) => {
              const isExpanded = expanded === item.id;
              const isLoading = loadingIds.includes(item.id);
              const canExpand = item.enabled && !isLoading;
              return (
                <div key={item.id}>
                  <div className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-bolt-light-2">
                    <button
                      type="button"
                      aria-label={`${isExpanded ? '收起' : '展开'} ${item.name} 工具`}
                      aria-disabled={!canExpand}
                      disabled={!canExpand}
                      onClick={() => canExpand && setExpanded(isExpanded ? null : item.id)}
                      className={`rounded-md p-1 transition ${canExpand ? 'text-bolt-light-7 hover:bg-bolt-light-4' : 'cursor-default text-bolt-light-5'}`}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[17px] font-semibold ${item.accent}`}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[14.5px] font-semibold text-bolt-light-12">{item.name}</h3>
                        <span className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-300' : item.enabled ? 'bg-emerald-500' : 'bg-bolt-light-6'}`} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-bolt-light-7">
                        {isLoading ? '正在加载工具…' : item.enabled ? `${item.tools.length}/${item.tools.length} 个工具已启用` : '工具'}
                      </p>
                    </div>
                    <span className={`w-12 text-right text-[12px] font-medium ${isLoading ? 'text-amber-500' : item.enabled ? 'text-emerald-600' : 'text-bolt-light-7'}`}>
                      {isLoading ? '加载中' : item.enabled ? '已启用' : '未启用'}
                    </span>
                    {isExpanded && item.enabled && (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => refreshMcp(item.id)}
                          disabled={isLoading}
                          title="重新同步工具"
                          aria-label={`重新同步 ${item.name} 工具`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-bolt-light-7 transition hover:bg-bolt-light-4 hover:text-bolt-light-11 disabled:cursor-wait disabled:opacity-50"
                        >
                          <RotateCw className={`h-[18px] w-[18px] ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMcp(item.id, item.name)}
                          title="删除自定义 MCP"
                          aria-label={`删除自定义 MCP ${item.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-bolt-light-7 transition hover:bg-red-50 hover:text-bolt-red"
                        >
                          <Trash2 className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.enabled}
                      aria-busy={isLoading}
                      aria-label={`${item.enabled ? '停用' : '启用'} ${item.name}`}
                      disabled={isLoading}
                      onClick={() => toggleMcp(item.id)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${isLoading ? 'cursor-wait bg-emerald-300' : item.enabled ? 'bg-emerald-500' : 'bg-bolt-light-6'}`}
                    >
                      <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${item.enabled || isLoading ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {isExpanded && item.enabled && (
                    <div className="border-t border-bolt-light-4 bg-bolt-light-2 px-20 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.tools.map((tool) => (
                          <span key={tool} className="rounded-md border border-bolt-light-5 bg-white px-2.5 py-1 text-[11.5px] text-bolt-light-9">{tool}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : query ? (
          <div className="mt-4 rounded-xl border border-dashed border-bolt-light-6 px-6 py-10 text-center text-[13px] text-bolt-light-7">
            {officialMatches ? '没有找到匹配的自定义 MCP' : '没有找到匹配的官方或自定义 MCP'}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SkillsCapabilityView({
  search,
  customSkills,
  onChange,
  onAddCustom,
}: {
  search: string;
  customSkills: CustomSkill[];
  onChange: Dispatch<SetStateAction<CustomSkill[]>>;
  onAddCustom: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const query = search.trim().toLowerCase();
  const officialSkills = CAPABILITIES.skills.filter((item) =>
    [item.name, item.description, item.meta].some((value) => value.toLowerCase().includes(query)),
  );
  const filteredCustom = customSkills.filter((item) =>
    [item.name, item.source, ...item.abilities].some((value) => value.toLowerCase().includes(query)),
  );

  const toggleSkill = (id: string) => {
    onChange((items) => items.map((item) => {
      if (item.id !== id) return item;
      if (item.enabled && expanded === id) setExpanded(null);
      return { ...item, enabled: !item.enabled };
    }));
  };

  const deleteSkill = (id: string, name: string) => {
    if (!window.confirm(`确定删除自定义 Skill「${name}」吗？删除后需要重新添加才能使用。`)) return;
    if (expanded === id) setExpanded(null);
    onChange((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="mt-8 space-y-8">
      {officialSkills.length > 0 && (
        <section>
          <h2 className="text-[16px] font-semibold text-bolt-light-11">平台内置能力</h2>
          <p className="mt-1 text-[12px] text-bolt-light-7">平台提供的 Skills，实际可用状态以账号接入配置为准。</p>
          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {officialSkills.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} className="flex items-center gap-4 rounded-xl border border-bolt-light-5 bg-white px-5 py-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-bolt-light-12">{item.name}</h3>
                    <p className="mt-1 text-[12.5px] leading-5 text-bolt-light-8">{item.description}</p>
                    <span className="mt-1.5 block text-[11.5px] text-bolt-light-7">{item.meta}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-bolt-light-11">我的扩展能力</h2>
            <p className="mt-1 text-[12px] text-bolt-light-7">添加团队或个人 Skill，并控制智能体是否可以调用。</p>
          </div>
          <button
            type="button"
            onClick={onAddCustom}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-bolt-blue bg-white px-4 text-[13px] font-semibold text-bolt-blue transition hover:bg-bolt-blue-light"
          >
            <Plus className="h-4 w-4" />
            添加自定义 Skill
          </button>
        </div>

        {filteredCustom.length > 0 ? (
          <div className="mt-4 divide-y divide-bolt-light-5 overflow-hidden rounded-xl border border-bolt-light-5 bg-white">
            {filteredCustom.map((item) => {
              const isExpanded = expanded === item.id;
              const canExpand = item.enabled;
              return (
                <div key={item.id}>
                  <div className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-bolt-light-2">
                    <button
                      type="button"
                      aria-label={`${isExpanded ? '收起' : '展开'} ${item.name} 能力`}
                      disabled={!canExpand}
                      onClick={() => canExpand && setExpanded(isExpanded ? null : item.id)}
                      className={`rounded-md p-1 transition ${canExpand ? 'text-bolt-light-7 hover:bg-bolt-light-4' : 'cursor-default text-bolt-light-5'}`}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[17px] font-semibold text-violet-600">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[14.5px] font-semibold text-bolt-light-12">{item.name}</h3>
                        <span className={`h-2 w-2 rounded-full ${item.enabled ? 'bg-emerald-500' : 'bg-bolt-light-6'}`} />
                      </div>
                      <p className="mt-1 truncate text-[12.5px] text-bolt-light-7">{item.enabled ? `${item.abilities.length} 项能力已启用` : 'Skill'}</p>
                    </div>
                    <span className={`w-12 text-right text-[12px] font-medium ${item.enabled ? 'text-emerald-600' : 'text-bolt-light-7'}`}>
                      {item.enabled ? '已启用' : '未启用'}
                    </span>
                    {isExpanded && item.enabled && (
                      <button
                        type="button"
                        onClick={() => deleteSkill(item.id, item.name)}
                        title="删除自定义 Skill"
                        aria-label={`删除自定义 Skill ${item.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-bolt-light-7 transition hover:bg-red-50 hover:text-bolt-red"
                      >
                        <Trash2 className="h-[18px] w-[18px]" />
                      </button>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.enabled}
                      aria-label={`${item.enabled ? '停用' : '启用'} ${item.name}`}
                      onClick={() => toggleSkill(item.id)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${item.enabled ? 'bg-emerald-500' : 'bg-bolt-light-6'}`}
                    >
                      <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {isExpanded && item.enabled && (
                    <div className="border-t border-bolt-light-4 bg-bolt-light-2 px-20 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.abilities.map((ability) => (
                          <span key={ability} className="rounded-md border border-bolt-light-5 bg-white px-2.5 py-1 text-[11.5px] text-bolt-light-9">{ability}</span>
                        ))}
                      </div>
                      <p className="mt-3 truncate text-[11px] text-bolt-light-7">来源：{item.source}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-bolt-light-6 bg-white px-6 py-10 text-center">
            <p className="text-[13px] font-medium text-bolt-light-9">{query ? '没有找到匹配的自定义 Skill' : '还没有添加自定义 Skill'}</p>
            {!query && <p className="mt-1 text-[12px] text-bolt-light-7">添加后可在这里启用、停用和查看能力明细。</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function OfficialCapabilityList({ activeTab, search }: { activeTab: Exclude<CapabilityTab, 'mcp'>; search: string }) {
  const items = CAPABILITIES[activeTab].filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()));
  const isComponentTab = activeTab === 'components';

  return (
    <section className="mt-8">
      <div>
        <h2 className="text-[16px] font-semibold text-bolt-light-11">{isComponentTab ? '设计组件' : '平台能力示例'}</h2>
        {isComponentTab && (
          <p className="mt-1 text-[12.5px] text-bolt-light-7">预览且慢设计规范中的常用金融组件，点击卡片查看完整示例。</p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.id}
              className="group rounded-xl border border-bolt-light-5 bg-white p-5 text-left transition hover:border-bolt-blue/40 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[15px] font-semibold text-bolt-light-12">{item.name}</h3>
                    <span className="rounded-md bg-bolt-blue-light px-2 py-0.5 text-[10.5px] font-semibold text-bolt-blue">
                      {isComponentTab ? '组件示例' : '能力示例'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-bolt-light-8">{item.description}</p>
                  <p className="mt-2 text-[11.5px] text-bolt-light-7">{item.meta}</p>
                </div>
              </div>
              {isComponentTab && (
                <div className="mt-4 overflow-hidden rounded-lg border border-bolt-light-4 bg-bolt-light-2 p-3 [&_.recharts-surface:focus]:outline-none">
                  <ComponentPreview id={item.id} compact />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

const CHART_COLORS = ['#69B1F4', '#F88D72', '#FBCA74', '#7DD4C4', '#68E0F3', '#ADAFE8'];
const TREND_DATA = [
  { period: '1月', portfolio: 100, benchmark: 100 },
  { period: '2月', portfolio: 104, benchmark: 102 },
  { period: '3月', portfolio: 102, benchmark: 103 },
  { period: '4月', portfolio: 109, benchmark: 106 },
  { period: '5月', portfolio: 113, benchmark: 108 },
  { period: '6月', portfolio: 118, benchmark: 111 },
];
const DRAWDOWN_DATA = [
  { period: '1月', value: 0 },
  { period: '2月', value: -2.1 },
  { period: '3月', value: -5.4 },
  { period: '4月', value: -3.2 },
  { period: '5月', value: -7.2 },
  { period: '6月', value: -2.6 },
];
const ALLOCATION_DATA = [
  { name: '权益基金', value: 48 },
  { name: '债券基金', value: 27 },
  { name: '黄金商品', value: 15 },
  { name: '现金类', value: 10 },
];
const COMPARE_DATA = [
  { name: '收益', 组合A: 18, 组合B: 14 },
  { name: '波动', 组合A: 12, 组合B: 9 },
  { name: '回撤', 组合A: 8, 组合B: 6 },
];
const STACKED_DATA = [
  { name: '2023', 权益: 45, 债券: 35, 其他: 20 },
  { name: '2024', 权益: 52, 债券: 31, 其他: 17 },
  { name: '2025', 权益: 48, 债券: 37, 其他: 15 },
];
const RADAR_DATA = [{ subject: '收益目标', value: 78 }, { subject: '风险承受', value: 62 }, { subject: '流动性', value: 86 }, { subject: '投资经验', value: 70 }, { subject: '持有耐心', value: 82 }];

function ComponentPreview({ id, compact = false }: { id: string; compact?: boolean }) {
  const chartHeight = compact ? 92 : 220;
  const axisProps = compact ? { tick: false, axisLine: false, tickLine: false } : { tick: { fontSize: 11, fill: '#999999' }, axisLine: false, tickLine: false };

  if (id === 'conclusion-card') {
    const metrics = [['组合健康度', '82 / 100'], ['持仓基金', '4只'], ['最大回撤', '-7.2%'], ['平均相关性', '0.63']];
    return <div className={`grid grid-cols-2 gap-2 ${compact ? '' : 'sm:grid-cols-4'}`}>{metrics.map(([label, value]) => <div key={label} className="rounded-lg border border-bolt-light-4 bg-white p-3"><p className="text-[10.5px] text-bolt-light-7">{label}</p><p className={`${compact ? 'mt-1 text-[14px]' : 'mt-2 text-[22px]'} font-semibold text-bolt-light-12`}>{value}</p></div>)}</div>;
  }

  if (id === 'status-callout') {
    return <div className="space-y-2"><div className="rounded-lg bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">组合分散度处于合理区间</div><div className="rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] text-amber-700">权益资产比例接近建议上限</div>{!compact && <div className="rounded-lg bg-[#FEEDE9] px-3 py-2 text-[11.5px] text-[#FA440C]">近一年最大回撤超过目标范围</div>}</div>;
  }

  if (id === 'financial-data-table') {
    return <div className="overflow-hidden rounded-lg border border-bolt-light-4 bg-white"><table className="w-full text-[11px]"><thead className="bg-bolt-light-3 text-bolt-light-8"><tr><th className="px-3 py-2 text-left font-medium">资产</th><th className="px-3 py-2 text-right font-medium">占比</th><th className="px-3 py-2 text-right font-medium">区间收益</th></tr></thead><tbody>{[['权益基金','48%','12.6%'],['债券基金','27%','3.8%'],['黄金商品','15%','8.1%']].slice(0, compact ? 2 : 3).map((row, index) => <tr key={row[0]} className={index % 2 ? 'bg-bolt-light-2' : 'bg-white'}><td className="px-3 py-2 text-bolt-light-10">{row[0]}</td><td className="px-3 py-2 text-right text-bolt-light-9">{row[1]}</td><td className="px-3 py-2 text-right text-bolt-light-9">{row[2]}</td></tr>)}</tbody></table></div>;
  }

  if (id === 'return-line-chart') {
    return <div style={{ height: chartHeight }}><ResponsiveContainer width="100%" height="100%"><RechartsLineChart data={TREND_DATA} margin={{ top: 8, right: 8, bottom: 0, left: compact ? 0 : 4 }}><CartesianGrid stroke="#D8D8D8" strokeOpacity={0.35} vertical={false} /><XAxis dataKey="period" {...axisProps} /><YAxis hide={compact} tick={{ fontSize: 11, fill: '#999999' }} axisLine={false} tickLine={false} /><Line type="monotone" dataKey="portfolio" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="benchmark" stroke={CHART_COLORS[5]} strokeWidth={2} dot={false} /></RechartsLineChart></ResponsiveContainer></div>;
  }

  if (id === 'drawdown-area-chart') {
    return <div style={{ height: chartHeight }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={DRAWDOWN_DATA} margin={{ top: 8, right: 8, bottom: 0, left: compact ? 0 : 4 }}><CartesianGrid stroke="#D8D8D8" strokeOpacity={0.35} vertical={false} /><XAxis dataKey="period" {...axisProps} /><YAxis hide={compact} tick={{ fontSize: 11, fill: '#999999' }} axisLine={false} tickLine={false} /><Area type="monotone" dataKey="value" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.2} strokeWidth={2} /></AreaChart></ResponsiveContainer></div>;
  }

  if (id === 'asset-allocation-donut') {
    return <div className="flex items-center gap-3"><div style={{ width: compact ? 110 : 210, height: chartHeight }}><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={ALLOCATION_DATA} dataKey="value" nameKey="name" innerRadius={compact ? 26 : 55} outerRadius={compact ? 42 : 88} paddingAngle={2}>{ALLOCATION_DATA.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index]} />)}</Pie></RechartsPieChart></ResponsiveContainer></div><div className="space-y-1.5">{ALLOCATION_DATA.slice(0, compact ? 3 : 4).map((entry, index) => <div key={entry.name} className="flex items-center gap-2 text-[11px] text-bolt-light-8"><span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[index] }} /><span>{entry.name} {entry.value}%</span></div>)}</div></div>;
  }

  if (id === 'metric-comparison-bar') {
    return <div style={{ height: chartHeight }}><ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={COMPARE_DATA} margin={{ top: 8, right: 8, bottom: 0, left: compact ? 0 : 4 }}><CartesianGrid stroke="#D8D8D8" strokeOpacity={0.35} vertical={false} /><XAxis dataKey="name" {...axisProps} /><YAxis hide={compact} axisLine={false} tickLine={false} /><Bar dataKey="组合A" fill={CHART_COLORS[0]} radius={[3,3,0,0]} /><Bar dataKey="组合B" fill={CHART_COLORS[2]} radius={[3,3,0,0]} /></RechartsBarChart></ResponsiveContainer></div>;
  }

  if (id === 'allocation-stacked-bar') {
    return <div style={{ height: chartHeight }}><ResponsiveContainer width="100%" height="100%"><RechartsBarChart data={STACKED_DATA} margin={{ top: 8, right: 8, bottom: 0, left: compact ? 0 : 4 }}><CartesianGrid stroke="#D8D8D8" strokeOpacity={0.35} vertical={false} /><XAxis dataKey="name" {...axisProps} /><YAxis hide={compact} axisLine={false} tickLine={false} /><Bar dataKey="权益" stackId="total" fill={CHART_COLORS[0]} /><Bar dataKey="债券" stackId="total" fill={CHART_COLORS[3]} /><Bar dataKey="其他" stackId="total" fill={CHART_COLORS[2]} radius={[3,3,0,0]} /></RechartsBarChart></ResponsiveContainer></div>;
  }

  return <div style={{ height: chartHeight }}><ResponsiveContainer width="100%" height="100%"><RadarChart data={RADAR_DATA} outerRadius={compact ? '70%' : '76%'}><PolarGrid stroke="#D8D8D8" /><PolarAngleAxis dataKey="subject" tick={compact ? false : { fontSize: 11, fill: '#606060' }} /><RechartsRadar dataKey="value" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.16} strokeWidth={2} /></RadarChart></ResponsiveContainer></div>;
}

function CustomMcpManager({ items, onChange, onClose }: { items: CustomMcp[]; onChange: (items: CustomMcp[]) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftUrl, setDraftUrl] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const filtered = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())),
    [items, search],
  );
  const enabledCount = items.filter((item) => item.enabled).length;

  const toggleMcp = (id: string) => {
    onChange(items.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  };

  const saveDraft = () => {
    if (!draftName.trim() || !draftUrl.trim()) return;
    onChange([
      ...items,
      {
        id: `custom-${Date.now()}`,
        name: draftName.trim(),
        description: `连接地址：${draftUrl.trim()}`,
        tools: ['等待首次同步工具清单'],
        enabled: false,
        icon: Database,
        accent: 'bg-slate-100 text-slate-600',
      },
    ]);
    setDraftName('');
    setDraftUrl('');
    setConfigOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-6 py-8" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-mcp-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-bolt-light-5 bg-white shadow-2xl animate-slide-up"
      >
        <header className="flex items-start gap-5 border-b border-bolt-light-5 px-7 py-6">
          <div className="min-w-0 flex-1">
            <h2 id="custom-mcp-title" className="text-[22px] font-bold text-bolt-light-12">自定义 MCP 管理</h2>
            <p className="mt-1 text-[13px] text-bolt-light-8">连接外部 MCP，扩展智能体可调用的能力。</p>
          </div>
          <button
            type="button"
            onClick={() => setConfigOpen((open) => !open)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-bolt-blue px-4 text-[13px] font-semibold text-bolt-blue hover:bg-bolt-blue-light"
          >
            <Plus className="h-4 w-4" />
            配置 MCP
          </button>
          <button type="button" onClick={onClose} aria-label="关闭" className="rounded-lg p-2 text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-12">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto px-7 py-6">
          {configOpen && (
            <div className="mb-6 rounded-xl border border-bolt-light-5 bg-bolt-light-2 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="MCP 名称"
                  className="h-10 rounded-lg border border-bolt-light-5 bg-white px-3 text-[13px] outline-none focus:border-bolt-blue"
                />
                <input
                  value={draftUrl}
                  onChange={(event) => setDraftUrl(event.target.value)}
                  placeholder="服务地址，例如 https://..."
                  className="h-10 rounded-lg border border-bolt-light-5 bg-white px-3 text-[13px] outline-none focus:border-bolt-blue"
                />
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={!draftName.trim() || !draftUrl.trim()}
                  className="h-10 rounded-lg bg-bolt-blue px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  保存连接
                </button>
              </div>
            </div>
          )}

          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bolt-light-7" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索 MCP"
              className="h-11 w-full rounded-lg border border-bolt-light-5 bg-white pl-10 pr-3 text-[13px] outline-none focus:border-bolt-blue"
            />
          </label>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-bolt-light-11">
              我的 MCP <span className="ml-1 rounded-full bg-bolt-light-4 px-2 py-0.5 text-[11px] text-bolt-light-8">{items.length}</span>
            </h3>
            <span className="text-[12.5px] text-bolt-light-8">{enabledCount} 个已启用</span>
          </div>

          <div className="mt-4 divide-y divide-bolt-light-5 overflow-hidden rounded-xl border border-bolt-light-5">
            {filtered.map((item) => {
              const Icon = item.icon;
              const isExpanded = expanded === item.id;
              return (
                <div key={item.id}>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <button
                      type="button"
                      aria-label={`${isExpanded ? '收起' : '展开'} ${item.name} 工具`}
                      onClick={() => setExpanded(isExpanded ? null : item.id)}
                      className="rounded-md p-1 text-bolt-light-7 hover:bg-bolt-light-3"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-[14px] font-semibold text-bolt-light-12">{item.name}</h4>
                        <span className={`h-2 w-2 rounded-full ${item.enabled ? 'bg-emerald-500' : 'bg-bolt-light-6'}`} />
                      </div>
                      <p className="mt-0.5 text-[12px] text-bolt-light-7">{item.tools.length} 个工具</p>
                    </div>
                    <span className={`w-12 text-right text-[12px] font-medium ${item.enabled ? 'text-emerald-600' : 'text-bolt-light-7'}`}>
                      {item.enabled ? '已启用' : '未启用'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.enabled}
                      aria-label={`${item.enabled ? '停用' : '启用'} ${item.name}`}
                      onClick={() => toggleMcp(item.id)}
                      className={`relative h-7 w-12 rounded-full transition-colors ${item.enabled ? 'bg-emerald-500' : 'bg-bolt-light-6'}`}
                    >
                      <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-bolt-light-4 bg-bolt-light-2 px-20 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.tools.map((tool) => (
                          <span key={tool} className="rounded-md border border-bolt-light-5 bg-white px-2.5 py-1 text-[11.5px] text-bolt-light-9">{tool}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-[13px] text-bolt-light-7">没有找到匹配的 MCP</div>
          )}

          <div className="mt-5 flex items-center justify-between rounded-lg bg-bolt-light-2 px-4 py-3 text-[11.5px] text-bolt-light-8">
            <span>关闭开关只会暂停智能体调用，不会删除连接配置。</span>
            <button type="button" className="inline-flex items-center gap-1 font-semibold text-bolt-blue hover:underline">
              了解调用权限
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AddCustomSkillModal({ onSave, onClose }: { onSave: (item: CustomSkill) => void; onClose: () => void }) {
  const [draftName, setDraftName] = useState('');
  const [draftSource, setDraftSource] = useState('');
  const [draftAbilities, setDraftAbilities] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const saveDraft = () => {
    if (!draftName.trim() || !draftSource.trim()) return;
    const abilities = draftAbilities
      .split(/[，,\n]/)
      .map((value) => value.trim())
      .filter(Boolean);
    onSave({
      id: `custom-skill-${Date.now()}`,
      name: draftName.trim(),
      source: draftSource.trim(),
      abilities: abilities.length > 0 ? abilities : ['等待读取 Skill 能力说明'],
      enabled: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-6 py-8" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-custom-skill-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-bolt-light-5 bg-white shadow-2xl animate-slide-up"
      >
        <header className="flex items-start gap-5 border-b border-bolt-light-5 px-7 py-6">
          <div className="min-w-0 flex-1">
            <h2 id="add-custom-skill-title" className="text-[20px] font-bold text-bolt-light-12">添加自定义 Skill</h2>
            <p className="mt-1 text-[13px] text-bolt-light-8">填写 Skill 的名称、来源与能力说明；保存后需手动启用。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭" className="rounded-lg p-2 text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-12">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-4 px-7 py-6">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-bolt-light-9">Skill 名称</span>
            <input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="例如 portfolio-review"
              className="h-11 w-full rounded-lg border border-bolt-light-5 px-3 text-[13px] outline-none focus:border-bolt-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-bolt-light-9">来源地址</span>
            <input
              value={draftSource}
              onChange={(event) => setDraftSource(event.target.value)}
              placeholder="仓库地址、Skill 文件地址或内部来源"
              className="h-11 w-full rounded-lg border border-bolt-light-5 px-3 text-[13px] outline-none focus:border-bolt-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-bolt-light-9">能力明细（可选）</span>
            <textarea
              value={draftAbilities}
              onChange={(event) => setDraftAbilities(event.target.value)}
              placeholder="使用逗号或换行分隔，例如：组合复盘、风险检查、结论生成"
              rows={3}
              className="w-full resize-none rounded-lg border border-bolt-light-5 px-3 py-2.5 text-[13px] outline-none focus:border-bolt-blue"
            />
          </label>
        </div>
        <footer className="flex justify-end gap-3 border-t border-bolt-light-5 px-7 py-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-bolt-light-5 px-4 text-[13px] font-medium text-bolt-light-9 hover:bg-bolt-light-2">取消</button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={!draftName.trim() || !draftSource.trim()}
            className="h-10 rounded-lg bg-bolt-blue px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存 Skill
          </button>
        </footer>
      </section>
    </div>
  );
}

function AddCustomMcpModal({ onSave, onClose }: { onSave: (item: CustomMcp) => void; onClose: () => void }) {
  const [draftName, setDraftName] = useState('');
  const [draftUrl, setDraftUrl] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const saveDraft = () => {
    if (!draftName.trim() || !draftUrl.trim()) return;
    onSave({
      id: `custom-${Date.now()}`,
      name: draftName.trim(),
      description: `连接地址：${draftUrl.trim()}`,
      tools: ['等待首次同步工具清单'],
      enabled: false,
      icon: Database,
      accent: 'bg-slate-100 text-slate-600',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-6 py-8" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-custom-mcp-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-bolt-light-5 bg-white shadow-2xl animate-slide-up"
      >
        <header className="flex items-start gap-5 border-b border-bolt-light-5 px-7 py-6">
          <div className="min-w-0 flex-1">
            <h2 id="add-custom-mcp-title" className="text-[22px] font-bold text-bolt-light-12">添加自定义 MCP</h2>
            <p className="mt-1 text-[13px] text-bolt-light-8">填写连接信息。添加后可在“我的扩展能力”中启用调用。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭" className="rounded-lg p-2 text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-12">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 px-7 py-6">
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-bolt-light-10">MCP 名称</span>
            <input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="例如：enterprise-research-mcp"
              className="h-11 w-full rounded-lg border border-bolt-light-5 bg-white px-3 text-[13px] outline-none focus:border-bolt-blue"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-bolt-light-10">服务地址</span>
            <input
              value={draftUrl}
              onChange={(event) => setDraftUrl(event.target.value)}
              placeholder="https://..."
              className="h-11 w-full rounded-lg border border-bolt-light-5 bg-white px-3 text-[13px] outline-none focus:border-bolt-blue"
            />
          </label>
          <p className="rounded-lg bg-bolt-light-2 px-4 py-3 text-[11.5px] leading-relaxed text-bolt-light-8">
            新连接默认关闭。保存后返回当前页面确认信息，再决定是否允许智能体调用。
          </p>
        </div>

        <footer className="flex justify-end gap-3 border-t border-bolt-light-5 px-7 py-5">
          <button type="button" onClick={onClose} className="h-10 rounded-lg border border-bolt-light-5 px-4 text-[13px] font-medium text-bolt-light-9 hover:bg-bolt-light-2">
            取消
          </button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={!draftName.trim() || !draftUrl.trim()}
            className="h-10 rounded-lg bg-bolt-blue px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存连接
          </button>
        </footer>
      </section>
    </div>
  );
}
