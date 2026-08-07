import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Code2,
  Copy,
  Database,
  Download,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  ListChecks,
  Loader2,
  MessageCircle,
  Monitor,
  PanelLeft,
  Paperclip,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChatMessage, Project } from '@/types';
import { EditableBlock, PreviewChrome } from '@/components/PreviewEdit';
import IntentSelector, { type IntentOption } from '@/components/IntentSelector';
import UserChatBubble from '@/components/UserChatBubble';

interface DesignPageProps {
  project: Project | null;
  initialPrompt: string | null;
  onCreateProject: (prompt: string) => Project;
  onPromoteToProject: (id: string, prompt: string) => void;
  onBack: () => void;
}

type ViewMode = 'preview' | 'code' | 'capabilities';
type DeviceMode = 'desktop' | 'mobile';
type BuildPhase = 'waiting' | 'clarifying' | 'thinking' | 'planning' | 'building' | 'ready';

const INTENT_OPTIONS: IntentOption[] = [
  {
    id: 'build-app',
    title: '直接做成可预览的金融应用',
    description: '按你的需求生成页面，并展示盈米 MCP / Skills 的执行过程。',
  },
  {
    id: 'fund-compare',
    title: '做基金对比研究 Dashboard',
    description: '对比收益、回撤、波动率与持仓，输出研究摘要页面。',
  },
  {
    id: 'portfolio',
    title: '做组合健康诊断',
    description: '分析资产配置、相关性和风险，给出改善方向。',
  },
  {
    id: 'explore',
    title: '先继续聊清楚需求',
    description: '先不急着构建，帮你把目标、用户和使用场景聊清楚。',
  },
];

interface ExecutionStep {
  name: string;
  type: 'MCP' | 'Skill';
  detail: string;
}

type CapabilityKind = 'MCP' | 'Skill' | 'Agent' | 'Component';

interface CapabilityRecord {
  name: string;
  type: CapabilityKind;
  detail: string;
}

/** 基金对比项目：打开时预填到输入框，发送后演示 Plan / 能力变化 */
const COMPARISON_FOLLOWUP_DEMO: {
  prompt: string;
  assistant: string;
  steps: ExecutionStep[];
  capabilities: CapabilityRecord[];
} = {
  prompt: '再加一列基金经理任职年限，并高亮回撤超过 15% 的基金',
  assistant: '已按你的要求更新对比表：新增基金经理任职年限，并对回撤超过 15% 的标的做了高亮提示。本轮 Plan 与能力汇总已同步。',
  steps: [
    { name: '批量获取基金详情', type: 'MCP', detail: '补充基金经理与任职年限信息' },
    { name: 'fund-analyst', type: 'Skill', detail: '按回撤阈值标注风险标的' },
    { name: 'design-data-visualization', type: 'Skill', detail: '更新表格列与高亮样式' },
  ],
  capabilities: [
    { name: '批量获取基金详情', type: 'MCP', detail: '补充基金经理与任职年限信息' },
    { name: 'fund-analyst', type: 'Skill', detail: '按回撤阈值标注风险标的' },
    { name: 'design-data-visualization', type: 'Skill', detail: '更新表格列与高亮样式' },
    { name: 'fund-compare-agent', type: 'Agent', detail: '编排对比表增强所需的 MCP 与 Skills' },
    { name: 'RiskHighlightTable', type: 'Component', detail: '回撤超阈值高亮表格组件' },
  ],
};

interface PreviewConfig {
  metrics: [string, string, string][];
  sectionTitle: string;
  headers: string[];
  rows: string[][];
  insights: [string, string][];
}

interface ScenarioConfig {
  key: 'comparison' | 'portfolio' | 'morning' | 'wealth' | 'screener' | 'allocation';
  title: string;
  planDescription: string;
  completion: string;
  steps: ExecutionStep[];
  preview?: PreviewConfig;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    key: 'comparison',
    title: '基金对比研究 Dashboard',
    planDescription: '先校验基金、获取业绩与净值，再生成分析和可视化页面。',
    completion: 'Dashboard 已生成。右侧预览展示了基金收益走势、风险指标和 fund-analyst 研究摘要。',
    steps: [
      { name: '基金代码模糊匹配', type: 'MCP', detail: '将基金名称匹配为准确代码' },
      { name: '批量获取基金详情', type: 'MCP', detail: '获取产品属性、基金经理与主要持仓' },
      { name: '批量获取基金业绩表现', type: 'MCP', detail: '对比收益、最大回撤与波动率' },
      { name: '基金净值历史', type: 'MCP', detail: '获取历史净值走势及区间表现' },
      { name: 'fund-analyst', type: 'Skill', detail: '生成多基对比与研究摘要' },
      { name: 'design-data-visualization', type: 'Skill', detail: '将结果组装为可交互 Dashboard' },
    ],
  },
  {
    key: 'portfolio',
    title: '基金组合健康诊断',
    planDescription: '识别持仓基金，评估资产配置、相关性与历史风险，生成组合诊断页面。',
    completion: '组合诊断已完成。右侧展示健康度、资产分布、相关性风险和 portfolio-doctor 建议。',
    steps: [
      { name: '基金代码模糊匹配', type: 'MCP', detail: '识别持仓中的基金名称与代码' },
      { name: '批量获取基金详情', type: 'MCP', detail: '获取基金类型、规模与持仓属性' },
      { name: '批量获取基金业绩表现', type: 'MCP', detail: '获取组合回测所需的收益风险指标' },
      { name: '基金诊断', type: 'MCP', detail: '获取单基多维诊断信号' },
      { name: 'portfolio-doctor', type: 'Skill', detail: '分析配置、相关性、回测与模拟结果' },
      { name: 'design-data-visualization', type: 'Skill', detail: '生成组合健康度可视化页面' },
    ],
    preview: {
      metrics: [['组合健康度', '82 / 100', '整体良好'], ['持仓基金', '4 只', '已完成识别'], ['最大回撤', '-7.2%', '近三年模拟'], ['平均相关性', '0.63', '存在一定重叠']],
      sectionTitle: '资产配置诊断',
      headers: ['资产类别', '当前占比', '建议区间', '诊断'],
      rows: [['权益基金', '58%', '45%–55%', '略偏高'], ['债券基金', '27%', '30%–40%', '略偏低'], ['黄金/商品', '8%', '5%–10%', '合理'], ['现金类', '7%', '5%–10%', '合理']],
      insights: [['集中度', '权益暴露偏高，两只成长风格基金持仓重叠。'], ['改善方向', '可适度增加低相关资产，具体调整需结合用户风险偏好。']],
    },
  },
  {
    key: 'morning',
    title: '市场早报网页',
    planDescription: '聚合财经资讯与基金经理观点，提取核心事件，生成结构化早报页面。',
    completion: '市场早报已生成。右侧展示核心数据、重要事件与 market-morning-brief 解读。',
    steps: [
      { name: '财经资讯', type: 'MCP', detail: '检索财经内容并提取核心事件' },
      { name: '基金经理观点', type: 'MCP', detail: '聚合基金经理公开观点与市场看法' },
      { name: 'market-morning-brief', type: 'Skill', detail: '聚合行情、热点和投顾内容生成市场简报' },
      { name: 'advisor-content-studio', type: 'Skill', detail: '完成文案编辑与 HTML 长页排版' },
    ],
    preview: {
      metrics: [['财经事件', '42 条', '已完成聚合'], ['市场热点', '6 个', '已完成去重'], ['经理观点', '8 条', '来自公开内容'], ['早报状态', '已发布', '08:00 更新']],
      sectionTitle: '今日核心事件',
      headers: ['时间', '事件', '影响', '来源'],
      rows: [['07:20', '权益市场量能回升', '风险偏好边际改善', '财经资讯'], ['07:35', '债市收益率窄幅波动', '固收类产品持续性待观察', '财经资讯'], ['07:50', '基金经理关注高股息方向', '结构性机会增加', '基金经理观点']],
      insights: [['市场主线', '价值与高股息方向关注度提升，成长风格分化。'], ['风险提示', '早报为公开信息摘要，不应作为单一投资决策依据。']],
    },
  },
  {
    key: 'wealth',
    title: '家庭财富规划报告',
    planDescription: '整理家庭资产负债与收支，测算财富目标，生成结构化财富规划报告。',
    completion: '家庭财富规划已生成。右侧展示财务健康度、目标达成情况和 wealth-report 摘要。',
    steps: [
      { name: '获取资产配置方案', type: 'MCP', detail: '获取与家庭目标匹配的配置规划方案' },
      { name: 'wealth-family-advisor', type: 'Skill', detail: '完成收支、资产负债与现金流评估' },
      { name: 'wealth-goalcalc', type: 'Skill', detail: '测算目标终值、达成率与月投缺口' },
      { name: 'wealth-report', type: 'Skill', detail: '整合为多模块 HTML 财富规划报告' },
    ],
    preview: {
      metrics: [['财务健康度', '78 / 100', '整体稳健'], ['家庭净资产', '286 万', '资产负债已对齐'], ['月度结余', '1.8 万', '储蓄率 32%'], ['应急资金', '8.6 个月', '高于建议下限']],
      sectionTitle: '财富目标进度',
      headers: ['目标', '目标金额', '预计达成', '当前状态'],
      rows: [['子女教育', '120 万', '2036 年', '进度正常'], ['家庭养老', '500 万', '2048 年', '月投存在缺口'], ['家庭旅行', '12 万', '2028 年', '可达成']],
      insights: [['现金流', '家庭月度结余稳定，应急资金覆盖充足。'], ['目标缺口', '养老目标的模拟月投存在缺口，需结合真实收支重新校验。']],
    },
  },
  {
    key: 'screener',
    title: '基金筛选工具',
    planDescription: '根据绩效、风险和产品属性筛选候选基金，通过诊断信号排除问题产品。',
    completion: '基金筛选已完成。右侧展示筛选条件、候选结果和 fund-screener 排除原因。',
    steps: [
      { name: '搜索基金', type: 'MCP', detail: '按多维条件搜索目标基金产品' },
      { name: '获取近期热门基金', type: 'MCP', detail: '补充当前市场热度较高的候选基金' },
      { name: '基金诊断', type: 'MCP', detail: '对候选基金执行多维量化诊断' },
      { name: 'fund-screener', type: 'Skill', detail: '完成多条件筛选、排雷与结果解释' },
      { name: 'design-data-visualization', type: 'Skill', detail: '生成候选基金比较和筛选页面' },
    ],
    preview: {
      metrics: [['初始候选', '68 只', '条件搜索结果'], ['通过筛选', '5 只', '符合所有条件'], ['诊断排除', '12 只', '存在风险信号'], ['数据完整度', '100%', '核心指标已对齐']],
      sectionTitle: '筛选结果',
      headers: ['基金', '近三年收益', '最大回撤', '筛选状态'],
      rows: [['优选稳健A', '+28.6%', '-9.2%', '通过'], ['价值均衡A', '+24.1%', '-7.8%', '通过'], ['红利低波A', '+20.7%', '-5.6%', '通过'], ['成长精选A', '+32.4%', '-18.9%', '风险待确认']],
      insights: [['筛选条件', '近三年收益为正、最大回撤低于 20%、基金经理任职满 3 年。'], ['重要说明', '筛选结果仅用于缩小研究范围，不等同于基金推荐。']],
    },
  },
  {
    key: 'allocation',
    title: '资产配置模拟器',
    planDescription: '明确财富目标与风险约束，测算目标缺口，生成资产配置模拟方案。',
    completion: '资产配置方案已生成。右侧展示目标配置、预期风险收益与 wealth-goalmatch 说明。',
    steps: [
      { name: '获取资产配置方案', type: 'MCP', detail: '基于目标需求生成匹配的资产配置规划' },
      { name: 'wealth-goalmatch', type: 'Skill', detail: '评估目标优先级与金额、期限合理性' },
      { name: 'wealth-goalcalc', type: 'Skill', detail: '测算目标终值、达成率与月投缺口' },
      { name: 'design-data-visualization', type: 'Skill', detail: '生成配置比例与情景模拟页面' },
    ],
    preview: {
      metrics: [['预期年化收益', '6.2%', '中性情景'], ['预期波动率', '8.9%', '模型测算'], ['压力回撤', '-12.4%', '压力情景'], ['目标匹配度', 'B+', '存在小幅缺口']],
      sectionTitle: '目标资产配置',
      headers: ['资产类别', '目标占比', '当前占比', '调整方向'],
      rows: [['国内权益', '35%', '42%', '降低'], ['海外权益', '15%', '8%', '增加'], ['固定收益', '35%', '30%', '增加'], ['黄金/商品', '10%', '8%', '小幅增加'], ['现金类', '5%', '12%', '降低']],
      insights: [['目标匹配', '当前组合权益集中度略高，海外与固收配置低于模拟目标。'], ['模拟限制', '预期收益与回撤来自 Demo 假设，不代表未来实际表现。']],
    },
  },
];

function getScenario(project: Project): ScenarioConfig {
  const text = `${project.name} ${project.description}`.toLowerCase();
  if (text.includes('组合健康') || text.includes('组合诊断')) return SCENARIOS.find((item) => item.key === 'portfolio')!;
  if (text.includes('早报') || text.includes('市场资讯')) return SCENARIOS.find((item) => item.key === 'morning')!;
  if (text.includes('家庭财富') || text.includes('财富规划')) return SCENARIOS.find((item) => item.key === 'wealth')!;
  if (text.includes('筛选')) return SCENARIOS.find((item) => item.key === 'screener')!;
  if (text.includes('资产配置') || text.includes('配置模拟')) return SCENARIOS.find((item) => item.key === 'allocation')!;
  return SCENARIOS[0];
}

function defaultProjectCapabilities(scenario: ScenarioConfig): CapabilityRecord[] {
  const agentName = scenario.key === 'comparison' ? 'fund-compare-agent' : `${scenario.key}-agent`;
  return [
    ...scenario.steps,
    {
      name: agentName,
      type: 'Agent',
      detail: `编排「${scenario.title}」相关的 MCP 与 Skills`,
    },
    {
      name: 'ResultDashboard',
      type: 'Component',
      detail: '结果预览与数据展示主界面组件',
    },
  ];
}

const performanceData = [
  { month: '3月', '稳健成长A': 100, '均衡价值A': 100, '红利低波A': 100 },
  { month: '4月', '稳健成长A': 101.8, '均衡价值A': 101.1, '红利低波A': 100.7 },
  { month: '5月', '稳健成长A': 104.2, '均衡价值A': 102.6, '红利低波A': 102.1 },
  { month: '6月', '稳健成长A': 103.1, '均衡价值A': 104.3, '红利低波A': 103.9 },
  { month: '7月', '稳健成长A': 108.6, '均衡价值A': 106.2, '红利低波A': 105.1 },
  { month: '8月', '稳健成长A': 112.8, '均衡价值A': 109.4, '红利低波A': 107.6 },
];

const fundRows = [
  { name: '稳健成长A', code: '000001', return: '+12.8%', drawdown: '-8.4%', volatility: '14.2%', risk: '中等' },
  { name: '均衡价值A', code: '000002', return: '+9.4%', drawdown: '-6.1%', volatility: '11.8%', risk: '中等' },
  { name: '红利低波A', code: '000003', return: '+7.6%', drawdown: '-3.9%', volatility: '8.6%', risk: '中低' },
];

function PlanCard({ phase, currentStep, steps, title, planDescription }: {
  phase: BuildPhase;
  currentStep: number;
  steps: ExecutionStep[];
  title: string;
  planDescription: string;
}) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(() => new Set());
  const [flowOpen, setFlowOpen] = useState(phase === 'planning');

  const mcpSteps = steps.filter((step) => step.type === 'MCP');
  const skillSteps = steps.filter((step) => step.type === 'Skill');

  useEffect(() => {
    if (phase === 'planning') setFlowOpen(true);
    if (phase === 'building' || phase === 'ready') setFlowOpen(false);
  }, [phase, title]);

  useEffect(() => {
    if (currentStep < 0) {
      setExpandedSteps(new Set());
      return;
    }

    const visibleStep = Math.min(currentStep, steps.length - 1);
    setExpandedSteps(new Set([visibleStep]));
  }, [currentStep, title, steps.length]);

  const toggleStep = (index: number) => {
    setExpandedSteps((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div data-testid="thinking-flow" className="animate-slide-up">
      <button
        type="button"
        onClick={() => setFlowOpen((open) => !open)}
        aria-expanded={flowOpen}
        className="w-full flex items-center justify-between gap-3 py-1.5 text-left text-bolt-light-7 hover:text-bolt-light-10 transition-colors"
      >
        <span className="min-w-0 flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium">
          {phase === 'planning' ? (
            <Loader2 className="w-3.5 h-3.5 text-bolt-blue animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 text-bolt-green" />
          )}
          <span>{phase === 'planning' ? '正在生成思考与执行计划' : `已完成思考与执行计划 · ${steps.length} 步`}</span>
          {phase !== 'planning' && (
            <span className="basis-full pl-[22px] text-[11px] font-normal leading-relaxed text-bolt-light-7">
              {mcpSteps.length} 个 MCP：{mcpSteps.map((step) => step.name).join('、')} · {skillSteps.length} 个 Skills：{skillSteps.map((step) => step.name).join('、')}
            </span>
          )}
        </span>
        {flowOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>

      {flowOpen && (
        <div data-testid="thinking-flow-content" className="space-y-4 pt-3 animate-fade-in">
          <p className="px-1 text-[13.5px] leading-relaxed text-bolt-light-11">
            我来帮你完成「{title}」。我会先检查需要的数据和金融能力，再生成页面。
          </p>

          {steps.map((step, index) => {
            const expanded = expandedSteps.has(index);
            return (
              <div key={`${step.name}-${index}`} className="px-1">
                <p className="text-[13.5px] leading-relaxed text-bolt-light-11 mb-2">{step.detail}。</p>
                <button
                  type="button"
                  onClick={() => toggleStep(index)}
                  aria-expanded={expanded}
                  className="w-full flex items-center justify-between gap-3 py-1 text-left text-bolt-light-7 hover:text-bolt-light-9 transition-colors"
                >
                  <span className="text-[12px] font-medium">盈米计划生成（调用1个工具）</span>
                  {expanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>

                {expanded && (
                  <div className="pt-2 pb-1 animate-fade-in">
                    <div data-testid="tool-call-pill" className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-bolt-light-3 px-3 py-1.5 text-[11.5px] text-bolt-light-8">
                      <img
                        data-testid="tool-call-icon"
                        src="/tool-call-link-icon.png"
                        alt=""
                        aria-hidden="true"
                        className="w-4 h-4 shrink-0 object-contain mix-blend-multiply"
                      />
                      <span className="shrink-0">调用工具</span>
                      <span className="text-bolt-light-6">|</span>
                      <span className="truncate font-medium">{step.name}</span>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <p className="mt-3 text-[12.5px] leading-relaxed text-bolt-light-8">
                      {step.type === 'MCP'
                        ? '这一步会通过盈米 MCP 读取任务必需的金融数据，并在执行记录中保留数据来源。'
                        : '这一步会使用盈米 Skill 对已获取的数据进行分析或页面生成，产出可预览的结果。'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <p className="px-1 pt-1 text-[13.5px] leading-relaxed text-bolt-light-11">执行计划已准备好。{planDescription}</p>

          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[10.5px] leading-relaxed text-amber-800">
              Demo 模式：将演示完整调用路径，预览中的名称与数据为模拟数据，不构成投资建议。
            </p>
          </div>

          <div className="rounded-lg bg-bolt-blue-light px-3 py-2 text-[11px] leading-relaxed text-bolt-blue">
            计划生成后将自动开始构建，无需再次确认。
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionChain({
  phase,
  currentStep,
  steps,
}: {
  phase: BuildPhase;
  currentStep: number;
  steps: ExecutionStep[];
}) {
  const [chainOpen, setChainOpen] = useState(phase === 'building');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(() => new Set());

  const visibleCount = phase === 'ready'
    ? steps.length
    : Math.min(Math.max(currentStep + 1, 0), steps.length);
  const visibleSteps = steps.slice(0, visibleCount);
  const mcpSteps = steps.filter((step) => step.type === 'MCP');
  const skillSteps = steps.filter((step) => step.type === 'Skill');

  useEffect(() => {
    if (phase === 'building') setChainOpen(true);
    if (phase === 'ready') setChainOpen(false);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'building' || currentStep < 0) return;
    setExpandedSteps(new Set([Math.min(currentStep, steps.length - 1)]));
  }, [phase, currentStep, steps.length]);

  const toggleStep = (index: number) => {
    setExpandedSteps((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (visibleSteps.length === 0) return null;

  return (
    <div data-testid="execution-chain" className="animate-slide-up">
      <button
        type="button"
        onClick={() => setChainOpen((open) => !open)}
        aria-expanded={chainOpen}
        className="w-full flex items-center justify-between gap-3 py-1.5 text-left text-bolt-light-7 hover:text-bolt-light-10 transition-colors"
      >
        <span className="min-w-0 flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium">
          {phase === 'building' ? (
            <Loader2 className="w-3.5 h-3.5 text-bolt-blue animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 text-bolt-green" />
          )}
          <span>
            {phase === 'building'
              ? `正在执行计划 · ${visibleCount}/${steps.length} 步`
              : `已完成思考与执行计划 · ${steps.length} 步`}
          </span>
          {phase === 'ready' && (
            <span className="basis-full pl-[22px] text-[11px] font-normal leading-relaxed text-bolt-light-7">
              {mcpSteps.length} 个 MCP：{mcpSteps.map((step) => step.name).join('、')} · {skillSteps.length} 个 Skills：{skillSteps.map((step) => step.name).join('、')}
            </span>
          )}
        </span>
        {chainOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>

      {chainOpen && (
        <div data-testid="execution-chain-content" className="space-y-4 pt-3 animate-fade-in">
          {visibleSteps.map((step, index) => {
            const expanded = expandedSteps.has(index);
            const isActive = phase === 'building' && index === currentStep;
            return (
              <div key={`${step.name}-${index}`} className="px-1 animate-fade-in">
                <p className="text-[13.5px] leading-relaxed text-bolt-light-11 mb-2">{step.detail}</p>
                <div className="rounded-xl border border-bolt-light-5 bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleStep(index)}
                    aria-expanded={expanded}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-bolt-light-7 hover:text-bolt-light-9 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-[12px] font-medium">
                      {isActive && <Loader2 className="w-3.5 h-3.5 text-bolt-blue animate-spin shrink-0" />}
                      {isActive ? '盈米正在执行（调用1个工具）' : '盈米计划生成（调用1个工具）'}
                    </span>
                    {expanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                  </button>

                  {expanded && (
                    <div className="px-3 pb-3 animate-fade-in">
                      <div data-testid="tool-call-pill" className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-bolt-light-3 px-3 py-1.5 text-[11.5px] text-bolt-light-8">
                        <img
                          data-testid="tool-call-icon"
                          src="/tool-call-link-icon.png"
                          alt=""
                          aria-hidden="true"
                          className="w-4 h-4 shrink-0 object-contain mix-blend-multiply"
                        />
                        <span className="shrink-0">调用工具</span>
                        <span className="text-bolt-light-6">|</span>
                        <span className="truncate font-medium">{step.name}</span>
                        {!isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                      <p className="mt-3 text-[12.5px] leading-relaxed text-bolt-light-8">
                        {step.type === 'MCP'
                          ? '这一步会通过盈米 MCP 读取任务必需的金融数据，并在执行记录中保留数据来源。'
                          : '这一步会使用盈米 Skill 对已获取的数据进行分析或页面生成，产出可预览的结果。'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ComparisonPreview({
  scenario,
  editMode = false,
  selectedId = null,
  onSelect = () => undefined,
}: {
  scenario: ScenarioConfig;
  editMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto bg-[#f6f8fb] text-bolt-light-12" onClick={() => editMode && onSelect('')}>
      <div className="bg-white border-b border-bolt-light-5 px-6 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-bolt-blue flex items-center justify-center shadow-sm">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{scenario.title}</h2>
          <p className="text-[12px] text-bolt-light-8">Demo 模拟数据 · 更新于 2026-08-05</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          仅供演示，不构成投资建议
        </span>
      </div>

      <div className="p-5 space-y-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            ['对比基金', '3 只', '已完成代码匹配'],
            ['近期最高收益', '+12.8%', '稳健成长A'],
            ['最低最大回撤', '-3.9%', '红利低波A'],
            ['数据覆盖', '100%', '4 个 MCP 工具'],
          ].map(([label, value, hint]) => (
            <EditableBlock
              key={label}
              id={`metric:${label}`}
              tag="CARD"
              editMode={editMode}
              selectedId={selectedId}
              onSelect={onSelect}
              className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm"
            >
              <p className="text-[11px] text-bolt-light-8">{label}</p>
              <p className="text-xl font-bold mt-1">{value}</p>
              <p className="text-[10.5px] text-bolt-light-7 mt-1">{hint}</p>
            </EditableBlock>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4">
          <EditableBlock
            id="chart:performance"
            tag="CHART"
            editMode={editMode}
            selectedId={selectedId}
            onSelect={onSelect}
            className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm min-h-[310px]"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-semibold">累计收益走势</h3>
                <p className="text-[10.5px] text-bolt-light-7">期初净值归一为 100</p>
              </div>
              <span className="text-[10.5px] text-bolt-light-7">2026.03—2026.08</span>
            </div>
            <div className="h-[235px]" role="img" aria-label="三只 Demo 基金累计收益走势对比图">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[98, 114]} tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Line type="monotone" dataKey="稳健成长A" stroke="#1380fd" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="均衡价值A" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="红利低波A" stroke="#10b981" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </EditableBlock>

          <EditableBlock
            id="summary:analyst"
            tag="DIV"
            editMode={editMode}
            selectedId={selectedId}
            onSelect={onSelect}
            className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-bolt-blue" />
              <h3 className="text-[14px] font-semibold">fund-analyst 摘要</h3>
            </div>
            <div className="space-y-3 text-[11.5px] leading-relaxed text-bolt-light-9">
              <p className="rounded-lg bg-bolt-blue-light p-3">
                <strong className="text-bolt-blue">收益领先：</strong>稳健成长A的阶段收益最高，同时波动率也更高。
              </p>
              <p className="rounded-lg bg-green-50 p-3">
                <strong className="text-bolt-green">回撤较低：</strong>红利低波A在示例周期内回撤最低，曲线更平稳。
              </p>
              <p className="rounded-lg bg-bolt-light-3 p-3">
                结论需结合更长周期、产品类型及用户风险偏好进一步验证。
              </p>
            </div>
          </EditableBlock>
        </div>

        <EditableBlock
          id="table:funds"
          tag="TABLE"
          editMode={editMode}
          selectedId={selectedId}
          onSelect={onSelect}
          className="rounded-xl bg-white border border-bolt-light-5 shadow-sm overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-bolt-light-5 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">关键指标对比</h3>
            <span className="text-[10.5px] text-bolt-light-7">指标口径已对齐</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-bolt-light-2 text-[10.5px] text-bolt-light-8">
                <tr>
                  <th className="px-4 py-2.5 font-medium">基金</th>
                  <th className="px-4 py-2.5 font-medium">代码</th>
                  <th className="px-4 py-2.5 font-medium">收益</th>
                  <th className="px-4 py-2.5 font-medium">最大回撤</th>
                  <th className="px-4 py-2.5 font-medium">波动率</th>
                  <th className="px-4 py-2.5 font-medium">风险</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bolt-light-4 text-[11.5px]">
                {fundRows.map((fund) => (
                  <tr key={fund.code}>
                    <td className="px-4 py-3 font-medium">{fund.name}</td>
                    <td className="px-4 py-3 text-bolt-light-8 font-mono">{fund.code}</td>
                    <td className="px-4 py-3 text-bolt-red font-semibold">{fund.return}</td>
                    <td className="px-4 py-3">{fund.drawdown}</td>
                    <td className="px-4 py-3">{fund.volatility}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-bolt-light-3 px-2 py-1 text-[10px]">{fund.risk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EditableBlock>
      </div>
    </div>
  );
}

function ScenarioPreview({
  scenario,
  editMode = false,
  selectedId = null,
  onSelect = () => undefined,
}: {
  scenario: ScenarioConfig;
  editMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const preview = scenario.preview!;
  return (
    <div className="h-full overflow-y-auto bg-[#f6f8fb] text-bolt-light-12" onClick={() => editMode && onSelect('')}>
      <div className="bg-white border-b border-bolt-light-5 px-6 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-bolt-blue flex items-center justify-center shadow-sm">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{scenario.title}</h2>
          <p className="text-[12px] text-bolt-light-8">Demo 模拟数据 · 更新于 2026-08-05</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          仅供演示，不构成投资建议
        </span>
      </div>

      <div className="p-5 space-y-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {preview.metrics.map(([label, value, hint]) => (
            <EditableBlock
              key={label}
              id={`metric:${label}`}
              tag="CARD"
              editMode={editMode}
              selectedId={selectedId}
              onSelect={onSelect}
              className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm"
            >
              <p className="text-[11px] text-bolt-light-8">{label}</p>
              <p className="text-xl font-bold mt-1">{value}</p>
              <p className="text-[10.5px] text-bolt-light-7 mt-1">{hint}</p>
            </EditableBlock>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4">
          <EditableBlock
            id="table:section"
            tag="TABLE"
            editMode={editMode}
            selectedId={selectedId}
            onSelect={onSelect}
            className="rounded-xl bg-white border border-bolt-light-5 shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-bolt-light-5 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">{preview.sectionTitle}</h3>
              <span className="text-[10.5px] text-bolt-light-7">口径已对齐</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-bolt-light-2 text-[10.5px] text-bolt-light-8">
                  <tr>
                    {preview.headers.map((header) => <th key={header} className="px-4 py-2.5 font-medium">{header}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bolt-light-4 text-[11.5px]">
                  {preview.rows.map((row, rowIndex) => (
                    <tr key={`${scenario.key}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`} className={`px-4 py-3 ${cellIndex === 0 ? 'font-medium' : 'text-bolt-light-9'}`}>
                          {cellIndex === row.length - 1 ? <span className="rounded-full bg-bolt-light-3 px-2 py-1 text-[10px]">{cell}</span> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EditableBlock>

          <EditableBlock
            id="summary:insights"
            tag="DIV"
            editMode={editMode}
            selectedId={selectedId}
            onSelect={onSelect}
            className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-bolt-blue" />
              <h3 className="text-[14px] font-semibold">{scenario.steps.find((step) => step.type === 'Skill')?.name} 摘要</h3>
            </div>
            <div className="space-y-3 text-[11.5px] leading-relaxed text-bolt-light-9">
              {preview.insights.map(([label, text], index) => (
                <p key={label} className={`rounded-lg p-3 ${index === 0 ? 'bg-bolt-blue-light' : 'bg-green-50'}`}>
                  <strong className={index === 0 ? 'text-bolt-blue' : 'text-bolt-green'}>{label}：</strong>{text}
                </p>
              ))}
              <p className="rounded-lg bg-bolt-light-3 p-3">本页为产品 Demo，所有名称与数据均为模拟内容。</p>
            </div>
          </EditableBlock>
        </div>
      </div>
    </div>
  );
}

function ProjectPreview({
  scenario,
  editMode = false,
  selectedId = null,
  onSelect = () => undefined,
}: {
  scenario: ScenarioConfig;
  editMode?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const props = { scenario, editMode, selectedId, onSelect };
  return scenario.key === 'comparison' ? <ComparisonPreview {...props} /> : <ScenarioPreview {...props} />;
}

interface CodeFile {
  path: string;
  language: 'ts' | 'tsx' | 'css' | 'json';
  content: string;
}

function buildProjectFiles(scenario: ScenarioConfig): CodeFile[] {
  const pageName = `${scenario.key[0].toUpperCase()}${scenario.key.slice(1)}Page`;
  const mcpList = scenario.steps
    .filter((step) => step.type === 'MCP')
    .map((step) => `  '${step.name}'`)
    .join(',\n');
  const skillList = scenario.steps
    .filter((step) => step.type === 'Skill')
    .map((step) => `  '${step.name}'`)
    .join(',\n');

  return [
    {
      path: 'src/App.tsx',
      language: 'tsx',
      content: `import { ${pageName} } from '@/pages/${scenario.key}'
import { YingmiProvider } from '@/contexts/YingmiContext'

export default function App() {
  return (
    <YingmiProvider>
      <${pageName} />
    </YingmiProvider>
  )
}
`,
    },
    {
      path: 'src/main.tsx',
      language: 'tsx',
      content: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`,
    },
    {
      path: 'src/index.css',
      language: 'css',
      content: `:root {
  --ym-blue: #1380fd;
  --ym-bg: #f6f8fb;
  --ym-text: #171717;
}

body {
  margin: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--ym-bg);
  color: var(--ym-text);
}
`,
    },
    {
      path: `src/pages/${scenario.key}.tsx`,
      language: 'tsx',
      content: `import { useFundWorkspace } from '@/hooks/useFundWorkspace'
import { MetricCard } from '@/components/MetricCard'
import { ResultTable } from '@/components/ResultTable'

export function ${pageName}() {
  const { loading, metrics, rows } = useFundWorkspace('${scenario.key}')

  if (loading) return <div className="p-8">正在加载盈米数据…</div>

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">${scenario.title}</h1>
        <p className="mt-1 text-sm text-slate-500">由盈米 MCP 与 Skills 生成</p>
      </header>
      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>
      <ResultTable rows={rows} />
    </main>
  )
}
`,
    },
    {
      path: 'src/components/MetricCard.tsx',
      language: 'tsx',
      content: `interface MetricCardProps {
  label: string
  value: string
  hint?: string
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}
`,
    },
    {
      path: 'src/components/ResultTable.tsx',
      language: 'tsx',
      content: `interface ResultTableProps {
  rows: Array<Record<string, string>>
}

export function ResultTable({ rows }: ResultTableProps) {
  if (rows.length === 0) return null
  const headers = Object.keys(rows[0])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-100">
              {headers.map((header) => (
                <td key={header} className="px-4 py-3 text-slate-700">{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
`,
    },
    {
      path: 'src/hooks/useFundWorkspace.ts',
      language: 'ts',
      content: `import { useEffect, useState } from 'react'
import { runYingmiPlan } from '@/lib/yingmi'

export function useFundWorkspace(scenario: string) {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Array<{ label: string; value: string; hint?: string }>>([])
  const [rows, setRows] = useState<Array<Record<string, string>>>([])

  useEffect(() => {
    let cancelled = false
    runYingmiPlan(scenario).then((result) => {
      if (cancelled) return
      setMetrics(result.metrics)
      setRows(result.rows)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [scenario])

  return { loading, metrics, rows }
}
`,
    },
    {
      path: 'src/lib/yingmi.ts',
      language: 'ts',
      content: `const MCP_TOOLS = [
${mcpList}
] as const

const SKILLS = [
${skillList}
] as const

export async function runYingmiPlan(scenario: string) {
  // Demo: 真实环境中会按顺序调用上方 MCP / Skills
  console.info('[yingmi]', scenario, MCP_TOOLS, SKILLS)
  return {
    metrics: [
      { label: '场景', value: '${scenario.title}', hint: 'Demo' },
      { label: 'MCP', value: String(MCP_TOOLS.length), hint: '已编排' },
      { label: 'Skills', value: String(SKILLS.length), hint: '已编排' },
      { label: '状态', value: 'Ready', hint: '可预览' },
    ],
    rows: [
      { 步骤: '理解需求', 状态: '完成' },
      { 步骤: '调用能力', 状态: '完成' },
      { 步骤: '生成页面', 状态: '完成' },
    ],
  }
}
`,
    },
    {
      path: 'src/contexts/YingmiContext.tsx',
      language: 'tsx',
      content: `import { createContext, useContext, type ReactNode } from 'react'

interface YingmiContextValue {
  dataMode: 'demo' | 'live'
  scenario: string
}

const YingmiContext = createContext<YingmiContextValue>({
  dataMode: 'demo',
  scenario: '${scenario.key}',
})

export function YingmiProvider({ children }: { children: ReactNode }) {
  return (
    <YingmiContext.Provider value={{ dataMode: 'demo', scenario: '${scenario.key}' }}>
      {children}
    </YingmiContext.Provider>
  )
}

export function useYingmi() {
  return useContext(YingmiContext)
}
`,
    },
    {
      path: 'plan.config.ts',
      language: 'ts',
      content: `// Yingmi Lab · Plan Mode demo
export const plan = {
  scenario: '${scenario.key}',
  title: '${scenario.title}',
  mcpTools: [
${mcpList}
  ],
  skills: [
${skillList}
  ],
  output: '${scenario.title}',
  dataMode: 'demo' as const,
}
`,
    },
    {
      path: 'package.json',
      language: 'json',
      content: `{
  "name": "yingmi-${scenario.key}",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
`,
    },
  ];
}

type CodeTreeNode =
  | { kind: 'dir'; name: string; path: string; children: CodeTreeNode[] }
  | { kind: 'file'; name: string; path: string; language: CodeFile['language'] };

function buildCodeTree(files: CodeFile[]): CodeTreeNode[] {
  const root: CodeTreeNode[] = [];
  const dirMap = new Map<string, CodeTreeNode & { kind: 'dir' }>();

  const getOrCreateDir = (dirPath: string) => {
    const existing = dirMap.get(dirPath);
    if (existing) return existing;
    const parts = dirPath.split('/');
    const node: CodeTreeNode & { kind: 'dir' } = {
      kind: 'dir',
      name: parts[parts.length - 1],
      path: dirPath,
      children: [],
    };
    dirMap.set(dirPath, node);
    if (parts.length === 1) root.push(node);
    else getOrCreateDir(parts.slice(0, -1).join('/')).children.push(node);
    return node;
  };

  for (const file of files) {
    const parts = file.path.split('/');
    const fileNode: CodeTreeNode = {
      kind: 'file',
      name: parts[parts.length - 1],
      path: file.path,
      language: file.language,
    };
    if (parts.length === 1) root.push(fileNode);
    else getOrCreateDir(parts.slice(0, -1).join('/')).children.push(fileNode);
  }

  const sortNodes = (nodes: CodeTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.kind === 'dir') sortNodes(node.children);
    });
  };
  sortNodes(root);
  return root;
}

function CodeWorkspace({ scenario }: { scenario: ScenarioConfig }) {
  const files = buildProjectFiles(scenario);
  const [query, setQuery] = useState('');
  const [activePath, setActivePath] = useState(files.find((file) => file.path.endsWith(`/${scenario.key}.tsx`))?.path ?? files[0]?.path ?? '');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(() => new Set(['src', 'src/components', 'src/hooks', 'src/pages', 'src/lib', 'src/contexts']));
  const [copied, setCopied] = useState(false);

  const filteredFiles = files.filter((file) =>
    query.trim() === '' || file.path.toLowerCase().includes(query.trim().toLowerCase())
  );
  const tree = buildCodeTree(filteredFiles);
  const activeFile = files.find((file) => file.path === activePath) ?? filteredFiles[0] ?? files[0];

  useEffect(() => {
    const preferred = files.find((file) => file.path.endsWith(`/${scenario.key}.tsx`))?.path ?? files[0]?.path ?? '';
    setActivePath(preferred);
  }, [scenario.key]);

  const toggleDir = (dir: string) => {
    setExpandedDirs((current) => {
      const next = new Set(current);
      if (next.has(dir)) next.delete(dir);
      else next.add(dir);
      return next;
    });
  };

  const copyCode = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const downloadCode = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = activeFile.path.split('/').pop() ?? 'file.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const langBadge = (language: CodeFile['language']) => {
    if (language === 'tsx') return { label: 'TS', className: 'bg-sky-100 text-sky-700' };
    if (language === 'ts') return { label: 'TS', className: 'bg-blue-100 text-blue-700' };
    if (language === 'css') return { label: 'CSS', className: 'bg-violet-100 text-violet-700' };
    return { label: 'JSON', className: 'bg-amber-100 text-amber-700' };
  };

  const renderTree = (nodes: CodeTreeNode[], depth = 0): ReactNode =>
    nodes.map((node) => {
      if (node.kind === 'dir') {
        const open = expandedDirs.has(node.path) || query.trim() !== '';
        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleDir(node.path)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[12.5px] text-bolt-light-10 hover:bg-bolt-light-3"
              style={{ paddingLeft: 8 + depth * 12 }}
            >
              {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-bolt-light-7" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-bolt-light-7" />}
              {open ? <FolderOpen className="h-3.5 w-3.5 shrink-0 text-bolt-blue" /> : <Folder className="h-3.5 w-3.5 shrink-0 text-bolt-blue" />}
              <span className="truncate">{node.name}</span>
            </button>
            {open && renderTree(node.children, depth + 1)}
          </div>
        );
      }

      const active = activeFile?.path === node.path;
      const badge = langBadge(node.language);
      return (
        <button
          key={node.path}
          type="button"
          onClick={() => setActivePath(node.path)}
          className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[12.5px] ${active ? 'bg-bolt-blue-light text-bolt-blue' : 'text-bolt-light-10 hover:bg-bolt-light-3'}`}
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded px-0.5 text-[8px] font-bold ${badge.className}`}>
            {badge.label.slice(0, 3)}
          </span>
          <span className="truncate">{node.name}</span>
        </button>
      );
    });

  const lines = (activeFile?.content ?? '').replace(/\n$/, '').split('\n');
  const activeBadge = activeFile ? langBadge(activeFile.language) : null;

  return (
    <div data-testid="code-workspace" className="flex h-full w-full overflow-hidden rounded-lg border border-bolt-light-5 bg-white shadow-md">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-bolt-light-5 bg-bolt-light-2">
        <div className="border-b border-bolt-light-5 px-3 py-3">
          <p className="mb-2 text-[13px] font-semibold text-bolt-light-12">代码</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-bolt-light-7" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索文件"
              className="w-full rounded-lg border border-bolt-light-5 bg-white py-1.5 pl-8 pr-3 text-[12px] text-bolt-light-12 outline-none placeholder:text-bolt-light-7 focus:border-bolt-blue"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredFiles.length === 0 ? (
            <p className="px-2 py-4 text-[12px] text-bolt-light-7">没有匹配的文件</p>
          ) : (
            renderTree(tree)
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex h-10 items-center gap-2 border-b border-bolt-light-5 px-2">
          {activeFile && activeBadge && (
            <div className="flex min-w-0 items-center gap-2 rounded-t-md border border-b-0 border-bolt-light-5 bg-white px-3 py-1.5">
              <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded px-0.5 text-[8px] font-bold ${activeBadge.className}`}>
                {activeBadge.label}
              </span>
              <span className="truncate text-[12px] text-bolt-light-11">{activeFile.path.split('/').pop()}</span>
              <span className="text-bolt-light-6">
                <X className="h-3 w-3" />
              </span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 pr-1">
            <button type="button" onClick={copyCode} aria-label="复制代码" className="rounded-md p-1.5 text-bolt-light-7 hover:bg-bolt-light-3 hover:text-bolt-light-11">
              <Copy className="h-4 w-4" />
            </button>
            <button type="button" onClick={downloadCode} aria-label="下载文件" className="rounded-md p-1.5 text-bolt-light-7 hover:bg-bolt-light-3 hover:text-bolt-light-11">
              <Download className="h-4 w-4" />
            </button>
            {copied && <span className="pr-2 text-[11px] text-bolt-green">已复制</span>}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {!activeFile ? (
            <div className="flex h-full items-center justify-center text-[13px] text-bolt-light-7">选择左侧文件查看代码</div>
          ) : (
            <div className="flex min-h-full font-mono text-[12.5px] leading-6">
              <div className="sticky left-0 select-none border-r border-bolt-light-5 bg-bolt-light-2 px-3 py-4 text-right text-bolt-light-7">
                {lines.map((_, index) => (
                  <div key={`ln-${index}`}>{index + 1}</div>
                ))}
              </div>
              <pre className="flex-1 overflow-x-auto whitespace-pre px-4 py-4 text-bolt-light-11">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

type CapabilityUsage = {
  name: string;
  type: CapabilityKind;
  detail: string;
  count: number;
};

const CAPABILITY_BADGE_CLASS: Record<CapabilityKind, string> = {
  MCP: 'bg-bolt-blue-light text-bolt-blue',
  Skill: 'bg-violet-50 text-bolt-purple',
  Agent: 'bg-emerald-50 text-emerald-700',
  Component: 'bg-amber-50 text-amber-700',
};

const CAPABILITY_TYPE_LABEL: Record<CapabilityKind, string> = {
  MCP: 'MCP',
  Skill: 'Skill',
  Agent: 'Agent',
  Component: '组件',
};

function aggregateCapabilityUsage(steps: CapabilityRecord[]): {
  mcpItems: CapabilityUsage[];
  skillItems: CapabilityUsage[];
  agentItems: CapabilityUsage[];
  componentItems: CapabilityUsage[];
} {
  const byKey = new Map<string, CapabilityUsage>();
  for (const step of steps) {
    const key = `${step.type}:${step.name}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      byKey.set(key, {
        name: step.name,
        type: step.type,
        detail: step.detail,
        count: 1,
      });
    }
  }
  const items = Array.from(byKey.values());
  return {
    mcpItems: items.filter((item) => item.type === 'MCP'),
    skillItems: items.filter((item) => item.type === 'Skill'),
    agentItems: items.filter((item) => item.type === 'Agent'),
    componentItems: items.filter((item) => item.type === 'Component'),
  };
}

function CapabilitiesWorkspace({
  usageSteps,
  ready,
}: {
  usageSteps: CapabilityRecord[];
  ready: boolean;
}) {
  const { mcpItems, skillItems, agentItems, componentItems } = aggregateCapabilityUsage(ready ? usageSteps : []);
  const totalCalls =
    mcpItems.reduce((sum, item) => sum + item.count, 0) +
    skillItems.reduce((sum, item) => sum + item.count, 0) +
    agentItems.reduce((sum, item) => sum + item.count, 0) +
    componentItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      data-testid="capabilities-workspace"
      className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-bolt-light-5 bg-white shadow-md"
    >
      <div className="border-b border-bolt-light-5 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-bolt-light-12">能力</h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-bolt-light-7">
              本项目累计使用的盈米 MCP、Skills、Agent 与组件
            </p>
          </div>
          {ready && (
            <div className="shrink-0 rounded-lg bg-bolt-light-3 px-3 py-2 text-right">
              <p className="text-[10px] font-medium text-bolt-light-7">合计调用</p>
              <p className="text-[16px] font-semibold tabular-nums text-bolt-light-12">{totalCalls}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!ready ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-bolt-light-3">
              <Sparkles className="h-6 w-6 text-bolt-light-7" />
            </div>
            <p className="text-[13.5px] font-medium text-bolt-light-10">尚未汇总能力使用</p>
            <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-bolt-light-7">
              构建完成后将汇总本项目使用的 MCP、Skills、Agent 与组件
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <CapabilityGroup title="MCP" items={mcpItems} emptyLabel="暂无 MCP 记录" />
            <CapabilityGroup title="Skills" items={skillItems} emptyLabel="暂无 Skills 记录" />
            <CapabilityGroup title="Agent" items={agentItems} emptyLabel="暂无 Agent 记录" />
            <CapabilityGroup title="组件" items={componentItems} emptyLabel="暂无组件记录" />
          </div>
        )}
      </div>
    </div>
  );
}

function CapabilityGroup({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: CapabilityUsage[];
  emptyLabel: string;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold tracking-wide text-bolt-light-8">{title}</h3>
        <span className="text-[11px] tabular-nums text-bolt-light-7">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-bolt-light-5 bg-bolt-light-2 px-3 py-6 text-center text-[12px] text-bolt-light-7">
          {emptyLabel}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.type}-${item.name}`} className="rounded-lg border border-bolt-light-5 bg-bolt-light-2 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${CAPABILITY_BADGE_CLASS[item.type]}`}>
                  {CAPABILITY_TYPE_LABEL[item.type]}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-bolt-light-11">{item.name}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-bolt-light-7">使用 {item.count} 次</span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-bolt-light-7">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExecutionPlanDock({
  phase,
  currentStep,
  title,
  steps,
}: {
  phase: BuildPhase;
  currentStep: number;
  title: string;
  steps: ExecutionStep[];
}) {
  const [open, setOpen] = useState(phase === 'thinking' || phase === 'planning' || phase === 'building');
  const isRunning = phase === 'thinking' || phase === 'planning' || phase === 'building';
  const isDone = phase === 'ready';

  useEffect(() => {
    if (isRunning) setOpen(true);
    if (isDone) setOpen(false);
  }, [isDone, isRunning]);

  const completedCount = isDone
    ? steps.length
    : phase === 'building'
      ? Math.max(0, currentStep)
      : 0;
  const currentLabel = phase === 'waiting'
    ? '等待生成执行计划'
    : phase === 'thinking'
      ? '正在理解需求'
      : phase === 'planning'
        ? '正在生成执行计划'
        : phase === 'building'
          ? steps[currentStep]?.name ?? '正在执行计划'
          : `${title} 已完成`;

  const activeStepIndex = phase === 'building'
    ? Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0))
    : -1;
  const activeStep = activeStepIndex >= 0 ? steps[activeStepIndex] : undefined;

  return (
    <div data-testid="execution-plan-dock" className="mx-3 rounded-xl border border-bolt-light-5 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full min-h-12 px-3.5 flex items-center gap-2 text-left hover:bg-bolt-light-2 transition-colors"
      >
        {isDone ? (
          <Check className="w-4 h-4 shrink-0 text-bolt-green" />
        ) : isRunning ? (
          <Loader2 className="w-4 h-4 shrink-0 text-bolt-blue animate-spin" />
        ) : (
          <ListChecks className="w-4 h-4 shrink-0 text-bolt-light-7" />
        )}
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-bolt-light-11">{currentLabel}</span>
        <span className="text-[11.5px] tabular-nums text-bolt-light-7">{completedCount}/{steps.length || 0}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-bolt-light-7" /> : <ChevronDown className="w-4 h-4 shrink-0 text-bolt-light-7" />}
      </button>

      {open && (
        <div data-testid="execution-plan-dock-content" className="border-t border-bolt-light-5 px-3 py-2 animate-fade-in">
          {isDone ? (
            <div data-testid="execution-plan-all-steps" className="space-y-0.5">
              {steps.map((step) => (
                <div key={step.name} className="flex items-center gap-2 rounded-lg px-2 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-bolt-green" />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-bolt-light-9">{step.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${step.type === 'MCP' ? 'bg-bolt-blue-light text-bolt-blue' : 'bg-violet-50 text-bolt-purple'}`}>
                    {step.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="execution-plan-recent-step" className="flex items-start gap-2 rounded-lg bg-bolt-blue-light px-2 py-2.5">
              <Loader2 className="w-4 h-4 mt-0.5 shrink-0 text-bolt-blue animate-spin" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-bolt-blue">
                    {activeStep?.name ?? currentLabel}
                  </span>
                  {activeStep && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${activeStep.type === 'MCP' ? 'bg-white/80 text-bolt-blue' : 'bg-violet-50 text-bolt-purple'}`}>
                      {activeStep.type}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-bolt-light-7">
                  {activeStep?.detail ?? (phase === 'thinking' ? '正在识别项目类型，并匹配所需的盈米 MCP 与 Skills。' : '正在整理执行步骤与能力调用顺序。')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DesignPage({ project, initialPrompt, onCreateProject, onPromoteToProject, onBack }: DesignPageProps) {
  const [requestPrompt, setRequestPrompt] = useState(initialPrompt ?? project?.description ?? '');
  const [requestPromptAt] = useState(() => project?.createdAt ?? new Date().toISOString());
  const [clarifyingReplyKey, setClarifyingReplyKey] = useState(0);
  const scenario = getScenario(project ?? {
    id: 'draft',
    name: requestPrompt || '新建项目',
    description: requestPrompt,
    starred: false,
    createdAt: new Date().toISOString(),
  });
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [phase, setPhase] = useState<BuildPhase>(() => {
    if (initialPrompt) return 'clarifying';
    if (project?.kind === 'chat') return 'clarifying';
    if (project) return 'ready';
    return 'waiting';
  });
  const [selectorDone, setSelectorDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [layoutMode] = useState<'focus' | 'three-column'>('focus');
  const [isRestoring, setIsRestoring] = useState(Boolean(project && !initialPrompt && project.kind !== 'chat'));
  const [showPlanPanel] = useState(true);
  const isComparisonDemo =
    Boolean(project && !initialPrompt && project.kind !== 'chat') && scenario.key === 'comparison';
  const [initialPlanCommitted, setInitialPlanCommitted] = useState(
    () => Boolean(project && !initialPrompt && project.kind !== 'chat')
  );
  const [activeSteps, setActiveSteps] = useState<ExecutionStep[]>(() => [...scenario.steps]);
  const [capabilityLog, setCapabilityLog] = useState<CapabilityRecord[]>(() =>
    project && !initialPrompt && project.kind !== 'chat' ? defaultProjectCapabilities(scenario) : []
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(() => (isComparisonDemo ? COMPARISON_FOLLOWUP_DEMO.prompt : ''));
  const [isRefining, setIsRefining] = useState(false);
  const replyTimerRef = useRef<number | null>(null);
  const pendingCapabilityLogRef = useRef(false);
  const pendingCapabilityRecordsRef = useRef<CapabilityRecord[] | null>(null);
  const followUpPromptRef = useRef<string | null>(null);
  const followUpAssistantRef = useRef<string | null>(null);
  const [previewExpired, setPreviewExpired] = useState(false);
  const [previewEditMode, setPreviewEditMode] = useState(false);
  const [selectedPreviewBlock, setSelectedPreviewBlock] = useState<string | null>(null);
  const [previewComment, setPreviewComment] = useState('');
  const [publishOpen, setPublishOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishSuccessOpen, setPublishSuccessOpen] = useState(false);
  const [copyToastOpen, setCopyToastOpen] = useState(false);
  const publishMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const [chatAttachments, setChatAttachments] = useState<File[]>([]);

  const publishShareUrl = `https://microapp.qieman.com/ai-lab/index.html#/share/${scenario.key}-${(project?.id ?? 'demo').slice(0, 8)}`;
  const publishFileName = project?.name || scenario.title;

  useEffect(() => {
    if (!copyToastOpen) return;
    const timer = window.setTimeout(() => setCopyToastOpen(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copyToastOpen]);

  const copyPublishLink = async () => {
    try {
      await navigator.clipboard.writeText(publishShareUrl);
      setCopyToastOpen(true);
    } catch {
      setCopyToastOpen(true);
    }
  };

  useEffect(() => {
    if (!publishOpen && !shareOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (publishOpen && publishMenuRef.current && !publishMenuRef.current.contains(target)) {
        setPublishOpen(false);
      }
      if (shareOpen && shareMenuRef.current && !shareMenuRef.current.contains(target)) {
        setShareOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [publishOpen, shareOpen]);

  useEffect(() => {
    if (!isRestoring) return;
    const restoreTimer = window.setTimeout(() => setIsRestoring(false), 1100);
    return () => window.clearTimeout(restoreTimer);
  }, [isRestoring]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, requestPrompt, isRefining, phase, currentStep]);

  useEffect(() => {
    if (phase === 'thinking') {
      const thinkingTimer = window.setTimeout(() => setPhase('planning'), 900);
      return () => window.clearTimeout(thinkingTimer);
    }
    if (phase === 'planning') {
      const planningTimer = window.setTimeout(() => {
        setCurrentStep(0);
        setPhase('building');
      }, 1700);
      return () => window.clearTimeout(planningTimer);
    }
    if (phase !== 'building') return;
    if (activeSteps.length === 0 || currentStep >= activeSteps.length - 1) {
      const doneTimer = window.setTimeout(() => setPhase('ready'), 800);
      return () => window.clearTimeout(doneTimer);
    }
    const stepTimer = window.setTimeout(() => setCurrentStep((step) => step + 1), 850);
    return () => window.clearTimeout(stepTimer);
  }, [phase, currentStep, activeSteps.length]);

  useEffect(() => {
    if (phase !== 'ready') return;

    if (pendingCapabilityLogRef.current) {
      pendingCapabilityLogRef.current = false;
      const records = pendingCapabilityRecordsRef.current ?? activeSteps;
      pendingCapabilityRecordsRef.current = null;
      setCapabilityLog((prev) => [...prev, ...records]);
      setInitialPlanCommitted(true);

      const followUp = followUpPromptRef.current;
      if (followUp) {
        followUpPromptRef.current = null;
        const assistantContent =
          followUpAssistantRef.current ??
          `已按「${followUp}」完成更新。本轮重新调用了相关 MCP、Skills、Agent 与组件，右侧预览与能力汇总已同步。`;
        followUpAssistantRef.current = null;
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-assistant`,
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } else if (capabilityLog.length === 0 && initialPlanCommitted) {
      setCapabilityLog(defaultProjectCapabilities(scenario));
    }
  }, [phase, activeSteps, capabilityLog.length, initialPlanCommitted, scenario]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    if (phase !== 'ready') {
      setPreviewExpired(false);
      return;
    }

    let inactivityTimer = window.setTimeout(() => setPreviewExpired(true), 30 * 60 * 1000);
    const resetInactivityTimer = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => setPreviewExpired(true), 30 * 60 * 1000);
    };

    window.addEventListener('pointerdown', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    return () => {
      window.clearTimeout(inactivityTimer);
      window.removeEventListener('pointerdown', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
    };
  }, [phase]);

  const clearReplyTimer = () => {
    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
  };

  const respondToUserContent = (content: string, mode: 'clarifying' | 'ready') => {
    clearReplyTimer();
    setIsRefining(true);
    replyTimerRef.current = window.setTimeout(() => {
      replyTimerRef.current = null;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content:
            mode === 'clarifying'
              ? `已重新理解你的消息：「${content}」。如果你准备好开始构建，可以再选一个上方选项，或直接告诉我“开始构建”。`
              : `已根据你修改后的消息重新回复：「${content}」。Demo 中会按新要求更新展示。`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsRefining(false);
    }, mode === 'clarifying' ? 900 : 1200);
  };

  const stopGeneration = () => {
    const wasBuilding = phase === 'thinking' || phase === 'planning' || phase === 'building';
    const wasRefining = isRefining;
    clearReplyTimer();
    setIsRefining(false);

    if (wasBuilding) {
      pendingCapabilityLogRef.current = false;
      pendingCapabilityRecordsRef.current = null;
      followUpPromptRef.current = null;
      followUpAssistantRef.current = null;
      if (phase === 'thinking' && !initialPlanCommitted) {
        setPhase('clarifying');
        setSelectorDone(true);
      } else {
        setPhase('ready');
      }
    }

    if (wasBuilding || wasRefining) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-stopped`,
          role: 'assistant',
          content: '已中断生成。你可以继续补充需求，或再次发送。',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const resendRequestPrompt = (next: string) => {
    const content = next.trim();
    if (!content) return;
    setRequestPrompt(content);
    setMessages([]);

    if (phase === 'clarifying') {
      setSelectorDone(false);
      clearReplyTimer();
      setIsRefining(true);
      replyTimerRef.current = window.setTimeout(() => {
        replyTimerRef.current = null;
        setClarifyingReplyKey((key) => key + 1);
        setIsRefining(false);
      }, 700);
      return;
    }

    if (phase === 'thinking' || phase === 'planning' || phase === 'building' || phase === 'ready') {
      if (project?.id) onPromoteToProject(project.id, content);
      setSelectorDone(true);
      setActiveSteps(scenario.steps);
      pendingCapabilityRecordsRef.current = defaultProjectCapabilities(scenario);
      pendingCapabilityLogRef.current = true;
      followUpPromptRef.current = null;
      setInitialPlanCommitted(false);
      setCapabilityLog([]);
      setCurrentStep(-1);
      setPhase('thinking');
    }
  };

  const resendChatMessage = (messageId: string, next: string) => {
    const content = next.trim();
    if (!content) return;
    setMessages((prev) => {
      const index = prev.findIndex((item) => item.id === messageId);
      if (index < 0) return prev;
      const updated = { ...prev[index], content, timestamp: new Date().toISOString() };
      return [...prev.slice(0, index), updated];
    });
    respondToUserContent(content, phase === 'clarifying' ? 'clarifying' : 'ready');
  };

  const startBuilding = (prompt: string) => {
    const nextPrompt = prompt.trim();
    if (!nextPrompt) return;
    setRequestPrompt(nextPrompt);
    if (project?.id) {
      onPromoteToProject(project.id, nextPrompt);
    }
    setSelectorDone(true);
    setActiveSteps(scenario.steps);
    pendingCapabilityRecordsRef.current = defaultProjectCapabilities(scenario);
    pendingCapabilityLogRef.current = true;
    followUpPromptRef.current = null;
    setCurrentStep(-1);
    setPhase('thinking');
  };

  const startComparisonFollowUp = (content: string) => {
    followUpPromptRef.current = content;
    followUpAssistantRef.current = COMPARISON_FOLLOWUP_DEMO.assistant;
    setActiveSteps(COMPARISON_FOLLOWUP_DEMO.steps);
    pendingCapabilityRecordsRef.current = COMPARISON_FOLLOWUP_DEMO.capabilities;
    pendingCapabilityLogRef.current = true;
    setCurrentStep(-1);
    setPhase('thinking');
  };

  const handleIntentSubmit = (value: { optionId: string; title: string; customText?: string }) => {
    if (value.optionId === 'explore') {
      setSelectorDone(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '好的，我们先继续聊需求。你可以补充目标用户、核心功能，或你最在意的数据指标。',
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    if (value.optionId === 'custom' && value.customText) {
      startBuilding(value.customText);
      return;
    }

    if (value.optionId === 'fund-compare') {
      startBuilding('创建一个基金对比研究 Dashboard，对比多只基金的收益、回撤、波动率与持仓');
      return;
    }

    if (value.optionId === 'portfolio') {
      startBuilding('做一个基金组合健康诊断工具，分析资产配置、相关性与风险');
      return;
    }

    const base = requestPrompt || project?.description || value.title;
    startBuilding(`${base}。优先目标：${value.title}`);
  };

  const sendMessage = () => {
    if (!input.trim() || isRefining || (phase !== 'waiting' && phase !== 'ready' && !(phase === 'clarifying' && selectorDone))) return;
    const content = input.trim();
    if (phase === 'waiting') {
      setRequestPrompt(content);
      setInput('');
      onCreateProject(content);
      setPhase('clarifying');
      setSelectorDone(false);
      return;
    }
    if (phase === 'clarifying') {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }]);
      setInput('');
      respondToUserContent(content, 'clarifying');
      return;
    }
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
    if (scenario.key === 'comparison') {
      startComparisonFollowUp(content);
      return;
    }
    respondToUserContent(content, 'ready');
  };

  const submitPreviewComment = () => {
    const note = previewComment.trim();
    if (!note || !selectedPreviewBlock || isRefining || phase !== 'ready') return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: note,
        timestamp: new Date().toISOString(),
      },
    ]);
    setPreviewComment('');
    clearReplyTimer();
    setIsRefining(true);
    replyTimerRef.current = window.setTimeout(() => {
      replyTimerRef.current = null;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: `已收到你的修改需求。Demo 中会按「${note}」调整预览展示。`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsRefining(false);
    }, 1200);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const stepState = (index: number) => {
    if (phase === 'ready' || (phase === 'building' && index < currentStep)) return 'done';
    if (phase === 'building' && index === currentStep) return 'active';
    return 'pending';
  };

  const deviceWidths: Record<DeviceMode, string> = {
    desktop: '100%',
    mobile: '390px',
  };

  const statusLabel = phase === 'waiting'
    ? '等待需求'
    : phase === 'clarifying'
      ? '澄清需求'
      : phase === 'thinking'
        ? '理解需求'
        : phase === 'planning'
          ? '生成计划'
          : phase === 'building'
            ? '执行中'
            : '已完成';

  const canSend = phase === 'waiting' || phase === 'ready' || (phase === 'clarifying' && selectorDone);
  const isGenerating =
    isRefining || phase === 'thinking' || phase === 'planning' || phase === 'building';
  const inputEnabled = canSend || isGenerating;

  if (isRestoring) {
    return (
      <div data-testid="project-restoring" className="h-screen bg-white flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-bolt-blue animate-spin mb-6" />
        <p className="text-[22px] tracking-wide text-bolt-light-12">
          正在打开项目
        </p>
        <p className="mt-3 text-[13px] text-bolt-light-7">正在加载对话、执行计划与预览</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className={`shrink-0 border-r border-bolt-light-5 bg-bolt-light-2 flex flex-col transition-all duration-200 overflow-hidden ${layoutMode === 'three-column' && showPlanPanel ? 'w-[280px]' : 'w-0 border-r-0'}`}>
        {layoutMode === 'three-column' && showPlanPanel && (
          <>
            <div className="h-14 flex items-center px-3 border-b border-bolt-light-5 gap-2">
              <button onClick={onBack} aria-label="返回项目列表" className="p-1.5 rounded-lg text-bolt-light-9 hover:bg-bolt-light-4">
                <ArrowLeft className="w-[18px] h-[18px]" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-bolt-light-12 truncate">{project?.name ?? '新建项目'}</div>
              <div className="text-[10.5px] text-bolt-light-7 truncate">
                {phase === 'waiting'
                  ? '发送首条消息后开始聊天'
                  : phase === 'clarifying' || project?.kind === 'chat'
                    ? '聊天澄清中'
                    : 'Plan Mode'}
              </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-[11px] font-semibold text-bolt-light-8 tracking-wider">执行计划</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${phase === 'ready' ? 'bg-green-50 text-bolt-green' : 'bg-bolt-blue-light text-bolt-blue'}`}>
                  {statusLabel}
                </span>
              </div>
              <div className="space-y-1">
                {(phase === 'waiting' || phase === 'thinking' || phase === 'clarifying') ? (
                  <div className="rounded-lg border border-dashed border-bolt-light-5 px-3 py-5 text-center text-[10.5px] leading-relaxed text-bolt-light-7">
                    {phase === 'waiting'
                      ? '执行计划将在你发送需求后生成'
                      : phase === 'clarifying'
                        ? '确认方向后才会生成执行计划'
                        : '正在理解需求，执行计划尚未生成'}
                  </div>
                ) : scenario.steps.map((step, index) => {
                  const state = stepState(index);
                  return (
                    <div key={step.name} className={`rounded-lg border p-2.5 transition-all ${state === 'active' ? 'border-bolt-blue bg-bolt-blue-light' : 'border-transparent hover:bg-bolt-light-3'}`}>
                      <div className="flex items-start gap-2">
                        {state === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-bolt-green mt-0.5 shrink-0" />
                        ) : state === 'active' ? (
                          <Loader2 className="w-4 h-4 text-bolt-blue mt-0.5 shrink-0 animate-spin" />
                        ) : (
                          <Circle className="w-4 h-4 text-bolt-light-6 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11.5px] font-medium text-bolt-light-11 truncate">{step.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${step.type === 'MCP' ? 'bg-bolt-blue-light text-bolt-blue' : 'bg-violet-50 text-bolt-purple'}`}>{step.type}</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-bolt-light-7 mt-1">{step.detail}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 px-2 mb-2 text-[11px] font-semibold text-bolt-light-8 tracking-wider">连接与安全</div>
              <div className="rounded-lg bg-white border border-bolt-light-5 p-3 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-bolt-light-9">
                  <Database className="w-3.5 h-3.5 text-bolt-blue" />
                  <span>盈米 MCP</span>
                  <span className="ml-auto text-bolt-green font-medium">已连接</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-bolt-light-9">
                  <ShieldCheck className="w-3.5 h-3.5 text-bolt-green" />
                  <span>数据范围</span>
                  <span className="ml-auto text-bolt-light-7">Demo 模拟</span>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      <section className="shrink-0 border-r border-bolt-light-5 bg-bolt-light-2 flex flex-col w-[520px]">
        <div className="h-14 flex items-center px-4 border-b border-bolt-light-5 gap-2">
          <button onClick={onBack} aria-label="返回项目列表" className="p-1.5 rounded-lg text-bolt-light-9 hover:bg-bolt-light-4">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <span className="text-[14px] font-semibold text-bolt-light-12 truncate">
            {project?.name || '新建对话'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {requestPrompt && (
            <UserChatBubble
              content={requestPrompt}
              timestamp={requestPromptAt}
              onCopied={() => setCopyToastOpen(true)}
              onResend={resendRequestPrompt}
            />
          )}

          {phase === 'waiting' && (
            <div data-testid="empty-conversation" className="min-h-[360px] flex flex-col items-center justify-center text-center px-8">
              <div className="w-11 h-11 rounded-xl bg-bolt-blue-light flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-bolt-blue" />
              </div>
              <p className="text-[13px] font-medium text-bolt-light-10">先告诉我你想创建什么</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-bolt-light-7">发送第一条消息后，会先进入聊天澄清需求，确认后再正式创建项目。</p>
            </div>
          )}

          {phase === 'clarifying' && (
            <div key={clarifyingReplyKey} className="space-y-3 animate-slide-up">
              <div className="flex justify-start">
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                  我理解你想围绕「{requestPrompt || project?.name || '这个想法'}」做点事情。在正式创建项目前，先选一个最贴近你目标的方向吧。
                </div>
              </div>
              {!selectorDone && (
                <IntentSelector
                  question="你现在最想先做成哪一件事？"
                  options={INTENT_OPTIONS}
                  onSubmit={handleIntentSubmit}
                  onSkip={() => startBuilding(requestPrompt || project?.description || '创建一个金融研究应用')}
                />
              )}
            </div>
          )}

          {phase === 'thinking' && !initialPlanCommitted && (
            <div data-testid="thinking-status" className="rounded-xl border border-bolt-light-5 bg-white px-3.5 py-3 flex items-center gap-2 animate-slide-up">
              <Loader2 className="w-4 h-4 text-bolt-blue animate-spin" />
              <div>
                <p className="text-[12px] font-medium text-bolt-light-11">正在理解你的需求</p>
                <p className="text-[10.5px] text-bolt-light-7 mt-0.5">正在识别项目类型并匹配盈米 MCP 与 Skills...</p>
              </div>
            </div>
          )}

          {initialPlanCommitted ? (
            <>
              <PlanCard
                phase="ready"
                currentStep={scenario.steps.length}
                steps={scenario.steps}
                title={scenario.title}
                planDescription={scenario.planDescription}
              />
              <div data-testid="first-ai-response" className="flex justify-start animate-slide-up">
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                  计划已经生成。我会按计划调用盈米 MCP 与 Skills，现在开始构建「{scenario.title}」。
                </div>
              </div>
              <ExecutionChain phase="ready" currentStep={scenario.steps.length} steps={scenario.steps} />
              <div className="flex justify-start animate-slide-up">
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                  {scenario.completion}
                </div>
              </div>
            </>
          ) : (
            <>
              {(phase === 'planning' || phase === 'building' || phase === 'ready') && (
                <PlanCard
                  phase={phase}
                  currentStep={currentStep}
                  steps={scenario.steps}
                  title={scenario.title}
                  planDescription={scenario.planDescription}
                />
              )}
              {(phase === 'building' || phase === 'ready') && (
                <div data-testid="first-ai-response" className="flex justify-start animate-slide-up">
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                    计划已经生成。我会按计划调用盈米 MCP 与 Skills，现在开始构建「{scenario.title}」。
                  </div>
                </div>
              )}
              {(phase === 'building' || phase === 'ready') && (
                <ExecutionChain phase={phase} currentStep={currentStep} steps={scenario.steps} />
              )}
              {phase === 'ready' && (
                <div className="flex justify-start animate-slide-up">
                  <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                    {scenario.completion}
                  </div>
                </div>
              )}
            </>
          )}

          {messages.map((message) =>
            message.role === 'user' ? (
              <UserChatBubble
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
                onCopied={() => setCopyToastOpen(true)}
                onResend={(next) => resendChatMessage(message.id, next)}
              />
            ) : (
              <div key={message.id} className="flex justify-start animate-slide-up">
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                  {message.content}
                </div>
              </div>
            )
          )}

          {isRefining && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-bolt-light-5 bg-white px-3 py-2 flex items-center gap-2 text-[11.5px] text-bolt-light-8">
                <RefreshCw className="w-3.5 h-3.5 text-bolt-blue animate-spin" />
                正在更新 Demo...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {layoutMode === 'focus' && (phase === 'thinking' || phase === 'planning' || phase === 'building' || phase === 'ready') && (
          <ExecutionPlanDock phase={phase} currentStep={currentStep} title={scenario.title} steps={activeSteps} />
        )}

        <div className={`p-3 ${layoutMode === 'three-column' ? 'border-t border-bolt-light-5' : 'pt-2'}`}>
          <div className="rounded-xl border border-bolt-light-5 bg-white focus-within:border-bolt-blue focus-within:shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!inputEnabled}
              placeholder={
                phase === 'waiting'
                  ? '描述你想创建的金融网站或应用...'
                  : phase === 'clarifying'
                    ? selectorDone
                      ? '继续补充需求，或选择上方方向开始构建...'
                      : '也可以先选择上方方向...'
                    : phase === 'ready'
                      ? '继续修改这个项目...'
                      : isGenerating
                        ? 'AI 正在生成，可点击停止中断...'
                        : '正在思考、规划和构建...'
              }
              rows={1}
              className="w-full bg-transparent resize-none outline-none px-3.5 pt-3 pb-2 text-[13px] text-bolt-light-12 placeholder:text-bolt-light-7 disabled:cursor-not-allowed"
            />
            {chatAttachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-1">
                {chatAttachments.map((file) => (
                  <span key={`${file.name}-${file.size}`} className="inline-flex max-w-full items-center gap-1 rounded-md bg-bolt-light-3 px-2 py-0.5 text-[11px] text-bolt-light-10">
                    <Paperclip className="h-3 w-3 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between px-2.5 pb-2.5">
              <button
                type="button"
                aria-label="添加文件"
                onClick={() => chatFileInputRef.current?.click()}
                className="rounded-md p-1.5 text-bolt-light-8 transition-colors hover:bg-bolt-light-3 hover:text-bolt-light-11"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={chatFileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (files.length > 0) setChatAttachments((prev) => [...prev, ...files]);
                  event.target.value = '';
                }}
              />
              {isGenerating ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  aria-label="停止生成"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-bolt-light-12 text-white transition-colors hover:bg-black"
                >
                  <span className="block h-2.5 w-2.5 rounded-[2px] bg-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={sendMessage}
                  aria-label="发送修改要求"
                  disabled={!input.trim() || !canSend}
                  className={`p-1.5 rounded-md ${input.trim() && canSend ? 'bg-bolt-blue text-white hover:bg-bolt-blue-dark' : 'bg-bolt-light-4 text-bolt-light-7 cursor-not-allowed'}`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 flex flex-col bg-bolt-light-3 min-w-0">
        <div className="h-14 border-b border-bolt-light-5 bg-white flex items-center px-4 gap-2">
          <div className="flex items-center gap-1 bg-bolt-light-3 rounded-lg p-0.5">
            <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium ${viewMode === 'preview' ? 'bg-white text-bolt-light-12 shadow-sm' : 'text-bolt-light-8 hover:text-bolt-light-11'}`}>
              <Eye className="w-4 h-4" />
              预览
            </button>
            <button onClick={() => setViewMode('code')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium ${viewMode === 'code' ? 'bg-white text-bolt-light-12 shadow-sm' : 'text-bolt-light-8 hover:text-bolt-light-11'}`}>
              <Code2 className="w-4 h-4" />
              代码
            </button>
            <button onClick={() => setViewMode('capabilities')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium ${viewMode === 'capabilities' ? 'bg-white text-bolt-light-12 shadow-sm' : 'text-bolt-light-8 hover:text-bolt-light-11'}`}>
              <Sparkles className="w-4 h-4" />
              能力
            </button>
          </div>

          {viewMode === 'preview' && (
            <div className="flex items-center gap-1 ml-2">
              {([
                { mode: 'desktop' as DeviceMode, icon: Monitor, label: '桌面预览' },
                { mode: 'mobile' as DeviceMode, icon: Smartphone, label: '手机预览' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setDeviceMode(mode)} aria-label={label} className={`p-1.5 rounded-md ${deviceMode === mode ? 'bg-bolt-light-4 text-bolt-light-12' : 'text-bolt-light-7 hover:text-bolt-light-10'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium ${phase === 'ready' ? 'bg-green-50 text-bolt-green' : 'bg-bolt-blue-light text-bolt-blue'}`}>
            {(phase === 'thinking' || phase === 'building') ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : phase === 'ready' ? <Check className="w-3.5 h-3.5" /> : <ListChecks className="w-3.5 h-3.5" />}
            {statusLabel}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative" ref={publishMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (published) {
                    setPublishSuccessOpen(true);
                    setPublishOpen(false);
                    setShareOpen(false);
                    return;
                  }
                  setPublishOpen((open) => !open);
                  setShareOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${published ? 'bg-bolt-light-12 text-white' : 'border border-bolt-light-5 bg-white text-bolt-light-12 hover:bg-bolt-light-2'}`}
              >
                <Globe className="w-4 h-4" />
                {published ? '已发布' : '发布'}
              </button>
              {publishOpen && !published && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[280px] rounded-xl border border-bolt-light-5 bg-white p-4 shadow-xl animate-fade-in">
                  <h3 className="text-[18px] font-bold tracking-tight text-bolt-light-12">发布</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-bolt-light-8">
                    发布后，外部用户可以访问你的应用
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPublished(true);
                      setPublishOpen(false);
                      setPublishSuccessOpen(true);
                    }}
                    className="mt-4 w-full rounded-xl bg-bolt-light-12 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-black"
                  >
                    立即发布
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={shareMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShareOpen((open) => !open);
                  setPublishOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-bolt-light-3 px-3 py-1.5 text-[13px] font-medium text-bolt-light-11 transition-colors hover:bg-bolt-light-4"
              >
                <Share2 className="w-4 h-4" />
                分享
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-[280px] rounded-xl border border-bolt-light-5 bg-white p-4 shadow-xl animate-fade-in">
                  <h3 className="text-[18px] font-bold tracking-tight text-bolt-light-12">分享</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-bolt-light-8">
                    复制链接后，可邀请同事一起查看这个 Demo 项目
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const shareUrl = `https://lab.yingmi.demo/p/${scenario.key}`;
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                      } catch {
                        // ignore clipboard failures in demo
                      }
                      setShareOpen(false);
                    }}
                    className="mt-4 w-full rounded-xl bg-bolt-light-12 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-black"
                  >
                    复制分享链接
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
          {viewMode === 'preview' ? (
            <div className="bg-white rounded-lg shadow-md border border-bolt-light-5 overflow-hidden transition-all duration-300" style={{ width: deviceWidths[deviceMode], maxWidth: '100%', height: '100%' }}>
              {phase === 'ready' && previewExpired ? (
                <div data-testid="preview-expired" className="h-full flex flex-col items-center justify-center bg-white p-8 text-center">
                  <h2 className="text-[22px] font-bold tracking-tight text-bolt-light-12">预览暂时休眠</h2>
                  <p className="mt-3 max-w-md text-[14px] leading-relaxed text-bolt-light-7">
                    为了节省资源，长时间未操作的项目已暂停预览。唤醒后可从当前位置继续查看和编辑。
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewExpired(false)}
                    className="mt-7 rounded-xl bg-bolt-light-12 px-7 py-3 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolt-blue focus-visible:ring-offset-2"
                  >
                    唤醒预览
                  </button>
                </div>
              ) : phase === 'waiting' ? (
                <div data-testid="empty-preview" className="h-full flex flex-col items-center justify-center bolt-grid-bg p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-bolt-light-4 flex items-center justify-center mb-4">
                    <Monitor className="w-8 h-8 text-bolt-light-7" />
                  </div>
                  <h2 className="text-lg font-bold text-bolt-light-12 mb-2">等待你的需求</h2>
                  <p className="text-bolt-light-8 text-sm max-w-sm">发送第一条消息后，这里会开始生成网站或应用预览。</p>
                </div>
              ) : phase === 'clarifying' ? (
                <div data-testid="clarifying-preview" className="h-full flex flex-col items-center justify-center bolt-grid-bg p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-bolt-purple" />
                  </div>
                  <h2 className="text-lg font-bold text-bolt-light-12 mb-2">还在聊天澄清需求</h2>
                  <p className="text-bolt-light-8 text-sm max-w-sm">确认方向并提交后，这里才会开始生成项目预览。</p>
                </div>
              ) : phase === 'thinking' ? (
                <div className="h-full flex flex-col items-center justify-center bolt-grid-bg p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-bolt-blue-light flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-bolt-blue animate-spin" />
                  </div>
                  <h2 className="text-lg font-bold text-bolt-light-12 mb-2">正在理解需求</h2>
                  <p className="text-bolt-light-8 text-sm max-w-sm">正在识别项目类型和需要使用的盈米能力。</p>
                </div>
              ) : phase === 'planning' ? (
                <div className="h-full flex flex-col items-center justify-center bolt-grid-bg p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-bolt-blue-light flex items-center justify-center mb-4">
                    <ListChecks className="w-8 h-8 text-bolt-blue" />
                  </div>
                  <h2 className="text-lg font-bold text-bolt-light-12 mb-2">正在生成执行计划</h2>
                  <p className="text-bolt-light-8 text-sm max-w-sm">
                    你可以在 Plan Mode 中查看将要使用的盈米 MCP 与 Skills，计划完成后会自动构建。
                  </p>
                </div>
              ) : phase === 'building' ? (
                <div className="h-full flex flex-col items-center justify-center bolt-grid-bg p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-bolt-blue flex items-center justify-center mb-4 bolt-glow">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <h2 className="text-lg font-bold text-bolt-light-12 mb-2">正在执行基金研究计划</h2>
                  <p className="text-bolt-light-8 text-sm">{activeSteps[currentStep]?.name}</p>
                  <div className="w-64 h-2 rounded-full bg-bolt-light-4 mt-5 overflow-hidden">
                    <div className="h-full rounded-full bg-bolt-blue transition-all duration-500" style={{ width: `${((currentStep + 1) / Math.max(activeSteps.length, 1)) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-bolt-light-7 mt-2">{currentStep + 1} / {activeSteps.length}</p>
                </div>
              ) : (
                <PreviewChrome
                  editMode={previewEditMode}
                  onEditModeChange={(value) => {
                    setPreviewEditMode(value);
                    if (!value) {
                      setSelectedPreviewBlock(null);
                      setPreviewComment('');
                    }
                  }}
                  comment={previewComment}
                  onCommentChange={setPreviewComment}
                  onSubmitComment={submitPreviewComment}
                  isSubmitting={isRefining}
                >
                  <ProjectPreview
                    scenario={scenario}
                    editMode={previewEditMode}
                    selectedId={selectedPreviewBlock}
                    onSelect={(id) => setSelectedPreviewBlock(id || null)}
                  />
                </PreviewChrome>
              )}
            </div>
          ) : viewMode === 'capabilities' ? (
            <CapabilitiesWorkspace usageSteps={capabilityLog} ready={phase === 'ready' || capabilityLog.length > 0} />
          ) : phase === 'waiting' ? (
            <div className="flex h-full w-full items-center justify-center rounded-lg border border-bolt-light-5 bg-white text-sm text-bolt-light-7 shadow-md">
              发送需求后生成项目代码
            </div>
          ) : (
            <CodeWorkspace scenario={scenario} />
          )}
        </div>
      </main>

      {publishSuccessOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4" onClick={() => setPublishSuccessOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-success-title"
            className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-2xl animate-fade-in"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 id="publish-success-title" className="text-[18px] font-bold tracking-tight text-bolt-light-12">
                分享链接已生成
              </h3>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setPublishSuccessOpen(false)}
                className="rounded-full bg-bolt-light-3 p-1.5 text-bolt-light-7 hover:bg-bolt-light-4 hover:text-bolt-light-11"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[13px] text-bolt-light-11">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-bolt-purple">
                <FileText className="h-4 w-4" />
              </span>
              <span className="truncate font-medium">{publishFileName}</span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-bolt-light-3 px-3 py-2.5">
              <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-bolt-light-9">
                {publishShareUrl}
              </p>
              <button
                type="button"
                onClick={copyPublishLink}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-bolt-blue/30 bg-bolt-blue-light px-2.5 py-1.5 text-[12px] font-semibold text-bolt-blue hover:bg-[#dbeafe]"
              >
                <Copy className="h-3.5 w-3.5" />
                复制
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPublishSuccessOpen(false)}
              className="mt-5 w-full rounded-xl bg-bolt-blue px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-bolt-blue-dark"
            >
              完成
            </button>
          </div>
        </div>
      )}

      {copyToastOpen && (
        <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center">
          <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-2xl animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bolt-blue">
              <Check className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-bolt-light-11">复制成功</p>
          </div>
        </div>
      )}
    </div>
  );
}
