import { useRef, useState } from 'react';
import { ArrowRight, Boxes, Bot, Database, Sparkles, Wrench } from 'lucide-react';

const TABS = [
  { id: 'mcp', label: 'MCP', icon: Database },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'agent', label: 'Agent', icon: Bot },
  { id: 'components', label: '组件', icon: Boxes },
] as const;

type ToolsTabId = (typeof TABS)[number]['id'];
type PlaceholderTabId = Exclude<ToolsTabId, 'mcp'>;

const TAB_PLACEHOLDERS: Record<PlaceholderTabId, { title: string; description: string; href?: string; linkLabel?: string }> = {
  skills: {
    title: 'Skills 尚未上线',
    description: 'Skills 页面正在准备中。当前 Demo 仅展示已经完成的 MCP 工具清单与工具详情。',
  },
  agent: {
    title: 'Agent',
    description: 'Agent 负责编排 MCP 与 Skills，按研究、诊断、报告等任务自动组织调用顺序。完整目录后续会与能力市场对齐。',
  },
  components: {
    title: '组件',
    description: '组件是可复用的金融界面模块，用于拼装图表、表格、报告页等预览结果。完整目录后续会继续补充。',
  },
};

const MCP_LIST_URL = '/mcp/盈米MCP_统一可分享版.html#tools/all';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolsTabId>('mcp');

  return (
    <div className="min-h-full px-8 pt-10 pb-0 animate-fade-in">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-bolt-blue-light px-3 py-1.5 text-[12px] font-semibold text-bolt-blue">
              <Wrench className="h-3.5 w-3.5" />
              盈米能力中心
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-bolt-light-12">盈米工具</h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-bolt-light-8">
              浏览盈米 MCP、Skills、Agent 与组件。当前已接入 MCP 工具清单与详情页，其他能力将陆续上线。
            </p>
          </div>
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

        {activeTab === 'mcp' ? (
          <McpCatalogFrame />
        ) : (
          <PlaceholderPanel tab={activeTab} />
        )}
      </div>
    </div>
  );
}

function McpCatalogFrame() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(1);

  const handleLoad = () => {
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    if (!frame || !doc) return;

    const style = doc.createElement('style');
    style.dataset.yingmiLabEmbed = 'true';
    style.textContent = `
      .official-footer,#unified-back{display:none!important}
      html,body{
        height:auto!important;
        min-height:0!important;
        overflow:hidden!important;
        background:transparent!important;
        background-image:none!important;
      }
      #unified-frame{display:block!important;min-height:0!important;border:0!important;background:transparent!important}
    `;
    doc.head.appendChild(style);
    for (const element of [doc.documentElement, doc.body]) {
      element.style.setProperty('height', 'auto', 'important');
      element.style.setProperty('min-height', '0', 'important');
      element.style.setProperty('overflow', 'hidden', 'important');
      element.style.setProperty('background', 'transparent', 'important');
      element.style.setProperty('background-image', 'none', 'important');
    }

    const innerFrame = doc.getElementById('unified-frame') as HTMLIFrameElement | null;
    const updateHeight = () => {
      const innerHeight = innerFrame?.getBoundingClientRect().height ?? 0;
      setFrameHeight(Math.max(1, Math.ceil(innerHeight)));
    };
    const simplifyEmbeddedPage = () => {
      const innerDoc = innerFrame?.contentDocument;
      if (!innerDoc) return;
      innerFrame.style.setProperty('visibility', 'visible');

      if (!innerDoc.getElementById('yingmi-lab-inner-overrides')) {
        const innerStyle = innerDoc.createElement('style');
        innerStyle.id = 'yingmi-lab-inner-overrides';
        innerStyle.textContent = `
        .topbar,.site-header{display:none!important}
        .page-heading{display:none!important}
        .page{width:100%!important;margin:0!important;padding:0!important}
        html,body,#root,.app-shell,.page{
          background:transparent!important;
          background-image:none!important;
        }
        html,body,#root,.app-shell,.page,.page-layout,.tools-main{min-height:0!important}
        html,body{overflow:hidden!important}
        .folder-stack{margin-top:0!important;overflow-x:hidden!important}
        .folder-layer{min-width:0!important;width:100%!important}
        .folder-tab{
          width:15%!important;
          min-width:0!important;
          padding-left:4px!important;
          padding-right:4px!important;
          gap:4px!important;
          font-size:clamp(11px,1.15vw,14px)!important;
        }
        .folder-layer:nth-child(1){--tab-left:1%!important}
        .folder-layer:nth-child(2){--tab-left:17.6%!important}
        .folder-layer:nth-child(3){--tab-left:34.2%!important}
        .folder-layer:nth-child(4){--tab-left:50.8%!important}
        .folder-layer:nth-child(5){--tab-left:67.4%!important}
        .folder-layer:nth-child(6){--tab-left:84%!important}
      `;
        innerDoc.head.appendChild(innerStyle);
      }

      for (const element of [innerDoc.documentElement, innerDoc.body]) {
        element.style.setProperty('min-height', '0', 'important');
        element.style.setProperty('overflow', 'hidden', 'important');
        element.style.setProperty('background', 'transparent', 'important');
        element.style.setProperty('background-image', 'none', 'important');
      }
      for (const selector of ['#root', '.app-shell', '.page', '.page-layout', '.tools-main']) {
        const element = innerDoc.querySelector<HTMLElement>(selector);
        element?.style.setProperty('min-height', '0', 'important');
        element?.style.setProperty('background', 'transparent', 'important');
        element?.style.setProperty('background-image', 'none', 'important');
      }

      innerFrame.setAttribute('scrolling', 'no');
      const updateInnerHeight = () => {
        const activeFolderBody = innerDoc.querySelector<HTMLElement>('.folder-layer.is-active .folder-body');
        const componentRoot = innerDoc.querySelector<HTMLElement>('.app-shell');
        const folderBottom = activeFolderBody?.getBoundingClientRect().bottom ?? 0;
        const componentHeight = folderBottom > 0
          ? folderBottom + 12
          : (componentRoot?.getBoundingClientRect().height ?? 0);
        const nextHeight = Math.ceil(componentHeight || Math.max(
          innerDoc.documentElement.scrollHeight,
          innerDoc.body.scrollHeight,
        ));
        if (nextHeight > 0) {
          innerFrame.style.setProperty('height', `${nextHeight}px`, 'important');
          requestAnimationFrame(updateHeight);
        }
      };
      requestAnimationFrame(updateInnerHeight);
      const innerObserver = new ResizeObserver(updateInnerHeight);
      innerObserver.observe(innerDoc.documentElement);
      innerObserver.observe(innerDoc.body);
      const componentRoot = innerDoc.querySelector<HTMLElement>('.app-shell');
      if (componentRoot) innerObserver.observe(componentRoot);
    };
    const validateAndPrepareInnerPage = () => {
      if (!innerFrame) return;
      try {
        const innerDoc = innerFrame.contentDocument;
        const hasRealContent = Boolean(innerDoc?.querySelector('.folder-stack,.hero,main'));
        innerFrame.style.setProperty('visibility', hasRealContent ? 'visible' : 'hidden');
        if (hasRealContent) simplifyEmbeddedPage();
      } catch {
        innerFrame.style.setProperty('visibility', 'hidden');
      }
    };
    innerFrame?.addEventListener('load', () => window.setTimeout(validateAndPrepareInnerPage, 60));
    validateAndPrepareInnerPage();

    requestAnimationFrame(updateHeight);
    const observer = new ResizeObserver(updateHeight);
    observer.observe(doc.documentElement);
    observer.observe(doc.body);
  };

  return (
    <div className="mt-6">
      <iframe
        ref={frameRef}
        src={MCP_LIST_URL}
        title="盈米 MCP 工具清单与详情"
        scrolling="no"
        onLoad={handleLoad}
        className="block w-full border-0 bg-transparent"
        style={{ height: frameHeight }}
      />
    </div>
  );
}

function PlaceholderPanel({ tab }: { tab: PlaceholderTabId }) {
  const placeholder = TAB_PLACEHOLDERS[tab];
  const Icon = TABS.find((item) => item.id === tab)?.icon ?? Database;

  return (
    <div role="tabpanel" className="mt-6 rounded-2xl border border-dashed border-bolt-light-6 bg-white/70 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bolt-blue-light text-bolt-blue">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[15px] font-semibold text-bolt-light-11">{placeholder.title}</p>
      <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-bolt-light-7">{placeholder.description}</p>
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
  );
}
