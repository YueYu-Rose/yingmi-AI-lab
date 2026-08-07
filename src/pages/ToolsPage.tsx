import { ArrowRight, Database, Sparkles, Wrench } from 'lucide-react';

interface ToolsPageProps {
  onStartCreating: () => void;
}

export default function ToolsPage({ onStartCreating }: ToolsPageProps) {
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
              浏览盈米 MCP 与 Skills，为金融网站和应用选择合适的数据能力与专业工作流。
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

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className="rounded-2xl border border-bolt-light-5 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bolt-blue-light">
              <Database className="h-5 w-5 text-bolt-blue" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-bolt-light-12">MCP 工具</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-bolt-light-8">
              连接基金、投顾与财富管理数据，为项目提供可调用、可追踪的金融能力。
            </p>
          </section>

          <section className="rounded-2xl border border-bolt-light-5 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
              <Sparkles className="h-5 w-5 text-bolt-purple" />
            </div>
            <h2 className="mt-5 text-lg font-bold text-bolt-light-12">Skills</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-bolt-light-8">
              将金融分析方法与页面生成流程组合为可复用能力，帮助 AI 更稳定地完成任务。
            </p>
          </section>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-bolt-light-6 bg-white/70 px-6 py-10 text-center">
          <p className="text-[14px] font-semibold text-bolt-light-11">工具市场页面框架已准备好</p>
          <p className="mt-1 text-[12.5px] text-bolt-light-7">收到你的 HTML 后，这里将展示完整的 MCP 与 Skills 内容。</p>
        </div>
      </div>
    </div>
  );
}
