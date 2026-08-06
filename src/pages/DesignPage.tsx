import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Code2,
  Database,
  Eye,
  Globe,
  ListChecks,
  Loader2,
  Monitor,
  PanelLeft,
  Paperclip,
  RefreshCw,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
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

interface DesignPageProps {
  project: Project | null;
  initialPrompt: string | null;
  onCreateProject: (prompt: string) => Project;
  onBack: () => void;
}

type ViewMode = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type BuildPhase = 'waiting' | 'thinking' | 'planning' | 'building' | 'ready';

interface ExecutionStep {
  name: string;
  type: 'MCP' | 'Skill';
  detail: string;
}

interface PreviewConfig {
  metrics: [string, string, string][];
  sectionTitle: string;
  headers: string[];
  rows: string[][];
  insights: [string, string][];
}

interface ScenarioConfig {
  key: 'comparison' | 'portfolio' | 'morning' | 'wealth' | 'screener' | 'allocation';
  badge: string;
  title: string;
  planDescription: string;
  completion: string;
  steps: ExecutionStep[];
  preview?: PreviewConfig;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    key: 'comparison',
    badge: '基金研究',
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
    badge: '组合诊断',
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
    badge: '市场资讯',
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
    badge: '财富规划',
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
    badge: '基金分析',
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
    badge: '资产配置',
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

function PlanCard({ phase, currentStep, scenario }: { phase: BuildPhase; currentStep: number; scenario: ScenarioConfig }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(() => new Set());
  const [flowOpen, setFlowOpen] = useState(phase === 'planning');

  const mcpSteps = scenario.steps.filter((step) => step.type === 'MCP');
  const skillSteps = scenario.steps.filter((step) => step.type === 'Skill');

  useEffect(() => {
    if (phase === 'planning') setFlowOpen(true);
    if (phase === 'building' || phase === 'ready') setFlowOpen(false);
  }, [phase, scenario.key]);

  useEffect(() => {
    if (currentStep < 0) {
      setExpandedSteps(new Set());
      return;
    }

    const visibleStep = Math.min(currentStep, scenario.steps.length - 1);
    setExpandedSteps(new Set([visibleStep]));
  }, [currentStep, scenario.key, scenario.steps.length]);

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
          <span>{phase === 'planning' ? '正在生成思考与执行计划' : `已完成思考与执行计划 · ${scenario.steps.length} 步`}</span>
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
            我来帮你完成「{scenario.title}」。我会先检查需要的数据和金融能力，再生成页面。
          </p>

          {scenario.steps.map((step, index) => {
            const expanded = expandedSteps.has(index);
            return (
              <div key={step.name} className="px-1">
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

          <p className="px-1 pt-1 text-[13.5px] leading-relaxed text-bolt-light-11">执行计划已准备好。{scenario.planDescription}</p>

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

function ComparisonPreview({ scenario }: { scenario: ScenarioConfig }) {
  return (
    <div className="h-full overflow-y-auto bg-[#f6f8fb] text-bolt-light-12">
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
            <div key={label} className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm">
              <p className="text-[11px] text-bolt-light-8">{label}</p>
              <p className="text-xl font-bold mt-1">{value}</p>
              <p className="text-[10.5px] text-bolt-light-7 mt-1">{hint}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4">
          <div className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm min-h-[310px]">
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
          </div>

          <div className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm">
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
          </div>
        </div>

        <div className="rounded-xl bg-white border border-bolt-light-5 shadow-sm overflow-hidden">
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
        </div>

        <div className="rounded-lg border border-bolt-light-5 bg-white px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] text-bolt-light-8">
          <span className="font-semibold text-bolt-light-10">本次使用记录</span>
          <span>{scenario.steps.filter((step) => step.type === 'MCP').length} 个盈米 MCP 工具</span>
          {scenario.steps.filter((step) => step.type === 'Skill').map((step) => <span key={step.name}>{step.name}</span>)}
          <span className="ml-auto">数据来源：Demo 模拟数据</span>
        </div>
      </div>
    </div>
  );
}

function ScenarioPreview({ scenario }: { scenario: ScenarioConfig }) {
  const preview = scenario.preview!;
  return (
    <div className="h-full overflow-y-auto bg-[#f6f8fb] text-bolt-light-12">
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
            <div key={label} className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm">
              <p className="text-[11px] text-bolt-light-8">{label}</p>
              <p className="text-xl font-bold mt-1">{value}</p>
              <p className="text-[10.5px] text-bolt-light-7 mt-1">{hint}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4">
          <div className="rounded-xl bg-white border border-bolt-light-5 shadow-sm overflow-hidden">
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
          </div>

          <div className="rounded-xl bg-white border border-bolt-light-5 p-4 shadow-sm">
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
          </div>
        </div>

        <div className="rounded-lg border border-bolt-light-5 bg-white px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] text-bolt-light-8">
          <span className="font-semibold text-bolt-light-10">本次使用记录</span>
          <span>{scenario.steps.filter((step) => step.type === 'MCP').length} 个盈米 MCP 工具</span>
          {scenario.steps.filter((step) => step.type === 'Skill').map((step) => <span key={step.name}>{step.name}</span>)}
          <span className="ml-auto">数据来源：Demo 模拟数据</span>
        </div>
      </div>
    </div>
  );
}

function ProjectPreview({ scenario }: { scenario: ScenarioConfig }) {
  return scenario.key === 'comparison' ? <ComparisonPreview scenario={scenario} /> : <ScenarioPreview scenario={scenario} />;
}

function ExecutionPlanDock({ phase, currentStep, scenario }: { phase: BuildPhase; currentStep: number; scenario: ScenarioConfig }) {
  const [open, setOpen] = useState(phase === 'planning' || phase === 'building');

  useEffect(() => {
    if (phase === 'planning' || phase === 'building') setOpen(true);
    if (phase === 'ready') setOpen(false);
  }, [phase]);

  const completedCount = phase === 'ready'
    ? scenario.steps.length
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
          ? scenario.steps[currentStep]?.name ?? '正在执行计划'
          : `${scenario.title} 已完成`;

  const getState = (index: number) => {
    if (phase === 'ready' || (phase === 'building' && index < currentStep)) return 'done';
    if (phase === 'building' && index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div data-testid="execution-plan-dock" className="mx-3 rounded-xl border border-bolt-light-5 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="w-full min-h-12 px-3.5 flex items-center gap-2 text-left hover:bg-bolt-light-2 transition-colors"
      >
        {phase === 'ready' ? (
          <Check className="w-4 h-4 shrink-0 text-bolt-green" />
        ) : phase === 'planning' || phase === 'building' || phase === 'thinking' ? (
          <Loader2 className="w-4 h-4 shrink-0 text-bolt-blue animate-spin" />
        ) : (
          <ListChecks className="w-4 h-4 shrink-0 text-bolt-light-7" />
        )}
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-bolt-light-11">{currentLabel}</span>
        <span className="text-[11.5px] tabular-nums text-bolt-light-7">{completedCount}/{scenario.steps.length}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-bolt-light-7" /> : <ChevronDown className="w-4 h-4 shrink-0 text-bolt-light-7" />}
      </button>

      {open && (
        <div data-testid="execution-plan-dock-content" className="border-t border-bolt-light-5 px-3 py-2 max-h-48 overflow-y-auto animate-fade-in">
          {scenario.steps.map((step, index) => {
            const state = getState(index);
            return (
              <div key={step.name} className={`flex items-center gap-2 rounded-lg px-2 py-2 ${state === 'active' ? 'bg-bolt-blue-light' : ''}`}>
                {state === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-bolt-green" />
                ) : state === 'active' ? (
                  <Loader2 className="w-4 h-4 shrink-0 text-bolt-blue animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 shrink-0 text-bolt-light-5" />
                )}
                <span className={`min-w-0 flex-1 truncate text-[11.5px] ${state === 'active' ? 'font-medium text-bolt-blue' : 'text-bolt-light-9'}`}>{step.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${step.type === 'MCP' ? 'bg-bolt-blue-light text-bolt-blue' : 'bg-violet-50 text-bolt-purple'}`}>{step.type}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DesignPage({ project, initialPrompt, onCreateProject, onBack }: DesignPageProps) {
  const [requestPrompt, setRequestPrompt] = useState(initialPrompt ?? project?.description ?? '');
  const scenario = getScenario(project ?? {
    id: 'draft',
    name: requestPrompt || '新建项目',
    description: requestPrompt,
    starred: false,
    createdAt: new Date().toISOString(),
  });
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [phase, setPhase] = useState<BuildPhase>(() => initialPrompt ? 'thinking' : project ? 'ready' : 'waiting');
  const [currentStep, setCurrentStep] = useState(-1);
  const [layoutMode, setLayoutMode] = useState<'focus' | 'three-column'>('focus');
  const [isRestoring, setIsRestoring] = useState(Boolean(project && !initialPrompt));
  const [showPlanPanel, setShowPlanPanel] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isRestoring) return;
    const restoreTimer = window.setTimeout(() => setIsRestoring(false), 1100);
    return () => window.clearTimeout(restoreTimer);
  }, [isRestoring]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, requestPrompt, isRefining]);

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
    if (currentStep >= scenario.steps.length - 1) {
      const doneTimer = window.setTimeout(() => setPhase('ready'), 800);
      return () => window.clearTimeout(doneTimer);
    }
    const stepTimer = window.setTimeout(() => setCurrentStep((step) => step + 1), 850);
    return () => window.clearTimeout(stepTimer);
  }, [phase, currentStep, scenario.steps.length]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [input]);

  const sendMessage = () => {
    if (!input.trim() || isRefining || (phase !== 'waiting' && phase !== 'ready')) return;
    const content = input.trim();
    if (phase === 'waiting') {
      setRequestPrompt(content);
      setInput('');
      onCreateProject(content);
      setPhase('thinking');
      return;
    }
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
    setIsRefining(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `已记录修改要求：「${content}」。Demo 中保留原数据口径，并更新页面展示。`,
        timestamp: new Date().toISOString(),
      }]);
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
    tablet: '768px',
    mobile: '390px',
  };

  const statusLabel = phase === 'waiting'
    ? '等待需求'
    : phase === 'thinking'
      ? '理解需求'
      : phase === 'planning'
        ? '生成计划'
        : phase === 'building'
          ? '执行中'
          : '已完成';

  const canSend = phase === 'waiting' || phase === 'ready';

  const mcpNames = scenario.steps.filter((step) => step.type === 'MCP').map((step) => `    '${step.name}'`).join(',\n');
  const skillNames = scenario.steps.filter((step) => step.type === 'Skill').map((step) => `'${step.name}'`).join(', ');
  const codeSnippet = `// Yingmi Lab · Plan Mode demo\nconst plan = {\n  scenario: '${scenario.key}',\n  mcpTools: [\n${mcpNames}\n  ],\n  skills: [${skillNames}],\n  output: '${scenario.title}',\n  dataMode: 'demo',\n};`;

  if (isRestoring) {
    return (
      <div data-testid="project-restoring" className="h-screen bg-white flex flex-col items-center justify-center text-center">
        <img src="/resume-loading-mark.png" alt="" aria-hidden="true" className="w-[54px] h-7 object-contain mb-6 animate-pulse" />
        <p className="text-[24px] tracking-wide text-bolt-light-12">
          正在恢复项目，<span className="text-bolt-light-7">请稍候…</span>
        </p>
        <p className="mt-3 text-[12px] text-bolt-light-7">正在加载上次的对话、执行计划与预览结果</p>
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
              <div className="text-[10.5px] text-bolt-light-7 truncate">{phase === 'waiting' ? '发送首条消息后创建项目' : `Plan Mode · ${scenario.badge}`}</div>
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
                {(phase === 'waiting' || phase === 'thinking') ? (
                  <div className="rounded-lg border border-dashed border-bolt-light-5 px-3 py-5 text-center text-[10.5px] leading-relaxed text-bolt-light-7">
                    {phase === 'waiting' ? '执行计划将在你发送需求后生成' : '正在理解需求，执行计划尚未生成'}
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

      <section className={`shrink-0 border-r border-bolt-light-5 bg-bolt-light-2 flex flex-col transition-[width] duration-200 ${layoutMode === 'focus' ? 'w-[520px]' : 'w-[410px]'}`}>
        <div className="h-14 flex items-center px-4 border-b border-bolt-light-5 gap-2">
          {layoutMode === 'focus' ? (
            <button onClick={onBack} aria-label="返回项目列表" className="p-1.5 rounded-lg text-bolt-light-9 hover:bg-bolt-light-4">
              <ArrowLeft className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <button onClick={() => setShowPlanPanel(!showPlanPanel)} aria-label="展开或收起执行计划" className="p-1.5 rounded-lg text-bolt-light-9 hover:bg-bolt-light-4">
              <PanelLeft className="w-[18px] h-[18px]" />
            </button>
          )}
          <span className="text-[14px] font-semibold text-bolt-light-12">Plan Mode</span>
          <span className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md bg-bolt-blue-light text-[10.5px] text-bolt-blue font-semibold">
            <Sparkles className="w-3 h-3" />
            {phase === 'waiting' ? '等待输入' : scenario.badge}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {requestPrompt && (
            <div className="flex justify-end">
              <div className="max-w-[88%] rounded-2xl rounded-br-md bg-bolt-blue text-white px-3.5 py-2.5 text-[12.5px] leading-relaxed">
                {requestPrompt}
              </div>
            </div>
          )}

          {phase === 'waiting' && (
            <div data-testid="empty-conversation" className="min-h-[360px] flex flex-col items-center justify-center text-center px-8">
              <div className="w-11 h-11 rounded-xl bg-bolt-blue-light flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-bolt-blue" />
              </div>
              <p className="text-[13px] font-medium text-bolt-light-10">先告诉我你想创建什么</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-bolt-light-7">发送第一条消息后，盈米实验室才会开始思考、规划和构建。</p>
            </div>
          )}

          {phase === 'thinking' && (
            <div data-testid="thinking-status" className="rounded-xl border border-bolt-light-5 bg-white px-3.5 py-3 flex items-center gap-2 animate-slide-up">
              <Loader2 className="w-4 h-4 text-bolt-blue animate-spin" />
              <div>
                <p className="text-[12px] font-medium text-bolt-light-11">正在理解你的需求</p>
                <p className="text-[10.5px] text-bolt-light-7 mt-0.5">正在识别项目类型并匹配盈米 MCP 与 Skills...</p>
              </div>
            </div>
          )}

          {(phase === 'planning' || phase === 'building' || phase === 'ready') && <PlanCard phase={phase} currentStep={currentStep} scenario={scenario} />}

          {(phase === 'building' || phase === 'ready') && (
            <div data-testid="first-ai-response" className="flex justify-start animate-slide-up">
              <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                计划已经生成。我会按计划调用盈米 MCP 与 Skills，现在开始构建「{scenario.title}」。
              </div>
            </div>
          )}

          {phase === 'building' && (
            <div className="rounded-xl border border-bolt-light-5 bg-white px-3.5 py-3 flex items-center gap-2 animate-slide-up">
              <Loader2 className="w-4 h-4 text-bolt-blue animate-spin" />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-bolt-light-11">正在执行 {currentStep + 1}/{scenario.steps.length}</p>
                <p className="text-[10.5px] text-bolt-light-7 truncate">{scenario.steps[currentStep]?.name}</p>
              </div>
            </div>
          )}

          {phase === 'ready' && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-bolt-light-5 bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bolt-light-11">
                {scenario.completion}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${message.role === 'user' ? 'bg-bolt-blue text-white rounded-br-md' : 'bg-white border border-bolt-light-5 text-bolt-light-11 rounded-bl-md'}`}>
                {message.content}
              </div>
            </div>
          ))}

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

        {layoutMode === 'focus' && (phase === 'planning' || phase === 'building' || phase === 'ready') && (
          <ExecutionPlanDock phase={phase} currentStep={currentStep} scenario={scenario} />
        )}

        <div className={`p-3 ${layoutMode === 'three-column' ? 'border-t border-bolt-light-5' : 'pt-2'}`}>
          <div className="rounded-xl border border-bolt-light-5 bg-white focus-within:border-bolt-blue focus-within:shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!canSend}
              placeholder={phase === 'waiting' ? '描述你想创建的金融网站或应用...' : phase === 'ready' ? '继续修改这个项目...' : '正在思考、规划和构建...'}
              rows={1}
              className="w-full bg-transparent resize-none outline-none px-3.5 pt-3 pb-2 text-[13px] text-bolt-light-12 placeholder:text-bolt-light-7 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between px-2.5 pb-2.5">
              <button disabled aria-label="Demo 中暂未开放附件" className="p-1.5 rounded-md text-bolt-light-7 cursor-not-allowed">
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                aria-label="发送修改要求"
                disabled={!input.trim() || isRefining || !canSend}
                className={`p-1.5 rounded-md ${input.trim() && !isRefining && canSend ? 'bg-bolt-blue text-white hover:bg-bolt-blue-dark' : 'bg-bolt-light-4 text-bolt-light-7 cursor-not-allowed'}`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
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
              配置
            </button>
          </div>

          {viewMode === 'preview' && (
            <div className="flex items-center gap-1 ml-2">
              {([
                { mode: 'desktop' as DeviceMode, icon: Monitor, label: '桌面预览' },
                { mode: 'tablet' as DeviceMode, icon: Tablet, label: '平板预览' },
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
            <button disabled title="Demo 中暂未开放" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bolt-light-5 text-[13px] font-medium text-bolt-light-7 cursor-not-allowed opacity-60">
              <Globe className="w-4 h-4" />
              发布
            </button>
            <button disabled title="Demo 中暂未开放" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bolt-light-4 text-bolt-light-7 text-[13px] font-medium cursor-not-allowed">
              <Share2 className="w-4 h-4" />
              分享
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
          {viewMode === 'preview' ? (
            <div className="bg-white rounded-lg shadow-md border border-bolt-light-5 overflow-hidden transition-all duration-300" style={{ width: deviceWidths[deviceMode], maxWidth: '100%', height: '100%' }}>
              {phase === 'waiting' ? (
                <div data-testid="empty-preview" className="h-full flex flex-col items-center justify-center bolt-grid-bg p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-bolt-light-4 flex items-center justify-center mb-4">
                    <Monitor className="w-8 h-8 text-bolt-light-7" />
                  </div>
                  <h2 className="text-lg font-bold text-bolt-light-12 mb-2">等待你的需求</h2>
                  <p className="text-bolt-light-8 text-sm max-w-sm">发送第一条消息后，这里会开始生成网站或应用预览。</p>
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
                  <p className="text-bolt-light-8 text-sm">{scenario.steps[currentStep]?.name}</p>
                  <div className="w-64 h-2 rounded-full bg-bolt-light-4 mt-5 overflow-hidden">
                    <div className="h-full rounded-full bg-bolt-blue transition-all duration-500" style={{ width: `${((currentStep + 1) / scenario.steps.length) * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-bolt-light-7 mt-2">{currentStep + 1} / {scenario.steps.length}</p>
                </div>
              ) : (
                <ProjectPreview scenario={scenario} />
              )}
            </div>
          ) : phase === 'waiting' ? (
            <div className="w-full h-full bg-[#111827] rounded-lg shadow-md border border-bolt-light-5 flex items-center justify-center text-sm text-slate-500">
              发送需求后生成项目配置
            </div>
          ) : (
            <div className="w-full h-full bg-[#111827] rounded-lg shadow-md border border-bolt-light-5 overflow-hidden flex flex-col">
              <div className="h-10 border-b border-white/10 bg-[#1f2937] flex items-center px-4">
                <span className="text-[11px] text-slate-400 font-mono">plan.config.ts</span>
                <span className="ml-auto text-[10px] text-amber-300 bg-amber-300/10 rounded px-2 py-0.5">Demo</span>
              </div>
              <div className="flex-1 overflow-auto p-5 font-mono text-[13px] leading-relaxed">
                <pre className="text-slate-300"><code>{codeSnippet}</code></pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <div data-testid="layout-mode-switch" className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-xl border border-bolt-light-5 bg-white/95 p-1 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setLayoutMode('focus')}
          aria-pressed={layoutMode === 'focus'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-colors ${layoutMode === 'focus' ? 'bg-bolt-blue text-white' : 'text-bolt-light-8 hover:bg-bolt-light-3'}`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          专注模式
        </button>
        <button
          type="button"
          onClick={() => setLayoutMode('three-column')}
          aria-pressed={layoutMode === 'three-column'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-colors ${layoutMode === 'three-column' ? 'bg-bolt-blue text-white' : 'text-bolt-light-8 hover:bg-bolt-light-3'}`}
        >
          <PanelLeft className="w-3.5 h-3.5" />
          三栏模式
        </button>
      </div>
    </div>
  );
}
