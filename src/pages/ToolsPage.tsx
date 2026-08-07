import { useState } from 'react';
import { ArrowRight, Boxes, Bot, Database, Sparkles, Wrench } from 'lucide-react';

interface ToolsPageProps {
  onStartCreating: () => void;
}

const TABS = [
  { id: 'mcp', label: 'MCP', icon: Database },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'agent', label: 'Agent', icon: Bot },
  { id: 'components', label: '组件', icon: Boxes },
] as const;

type ToolsTabId = (typeof TABS)[number]['id'];

const TAB_PLACEHOLDERS: Record<ToolsTabId, { title: string; description: string; href?: string; linkLabel?: string }> = {
  mcp: {
    title: 'MCP 市场',
    description:
      '盈米 MCP 让 AI 直接调用基金、投顾与财富管理相关能力，把行情、产品、组合与研究数据接进对话与应用构建流程。',
    href: 'https://qieman.com/mcp/mcp-market',
    linkLabel: '前往且慢 MCP 市场',
  },
  skills: {
    title: 'Skills 市场',
    description:
      'Skills 是可复用的金融工作流，把多步 MCP 调用编排成研究、诊断、筛选与报告等任务，帮助更快完成专业分析与页面生成。',
    href: 'https://qieman.com/mcp/skill-market',
    linkLabel: '前往且慢 Skills 市场',
  },
  agent: {
    title: 'Agent',
    description: '可编排 MCP 与 Skills 的智能助手。具体列表稍后补充。',
  },
  components: {
    title: '组件',
    description: '可复用的金融界面模块与可视化组件。具体列表稍后补充。',
  },
};

export default function ToolsPage({ onStartCreating }: ToolsPageProps) {
  const [activeTab, setActiveTab] = useState<ToolsTabId>('mcp');
  const placeholder = TAB_PLACEHOLDERS[activeTab];

  return (
    <div className="min-h-full px-8 py-10 animate-fade-in">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-bolt-blue-light px-3 py-1.5 text-[12px] font-semibold text-bolt-blue">
              <Wrench className="h-3.5 w-3.5" />
              盈米能力中心
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-bolt-light-12">盈米工具</h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-bolt-light-8">
              浏览盈米 MCP、Skills、Agent 与组件。MCP 与 Skills 对齐且慢能力市场，可在创建时按需调用。
            </p>
          </div>
          <button
            type="button"
            onClick={onStartCreating}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-bolt-blue px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-bolt-blue-dark"
          >
            开始创建
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 border-b border-bolt-light-5">
          <div className="flex items-center gap-1" role="tablist" aria-label="盈米工具分类">
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
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-[13.5px] font-medium transition-colors ${
                    active ? 'text-bolt-blue' : 'text-bolt-light-8 hover:text-bolt-light-11'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {active && <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-bolt-blue" />}
                </button>
              );
            })}
          </div>
        </div>

        <div role="tabpanel" className="mt-6 rounded-2xl border border-dashed border-bolt-light-6 bg-white/70 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bolt-blue-light text-bolt-blue">
            {(() => {
              const Icon = TABS.find((tab) => tab.id === activeTab)?.icon ?? Database;
              return <Icon className="h-5 w-5" />;
            })()}
          </div>
          <p className="text-[15px] font-semibold text-bolt-light-11">{placeholder.title}</p>
          <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-bolt-light-7">
            {placeholder.description}
          </p>
          {placeholder.href && placeholder.linkLabel && (
            <a
              href={placeholder.href}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-bolt-blue hover:text-bolt-blue-dark"
            >
              {placeholder.linkLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
