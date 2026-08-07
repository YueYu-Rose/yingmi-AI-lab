import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Paperclip,
  AtSign,
  Palette,
  Sliders,
  Sparkles,
  ChevronDown,
  Eye,
  Code2,
  Share2,
  MoreHorizontal,
  PanelLeft,
  Smartphone,
  Monitor,
  Tablet,
  Loader2,
  Check,
  Globe,
  GitBranch,
} from 'lucide-react';
import type { ChatMessage, Project } from '@/types';

interface DesignPageProps {
  project: Project;
  onBack: () => void;
}

type ViewMode = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

function generateBotResponse(prompt: string): string {
  const responses = [
    `我来帮你处理这个。让我分析一下你的需求：「${prompt}」。我正在搭建组件结构和样式。预览会在构建过程中自动更新。`,
    `明白了。根据你的需求，我正在创建响应式布局。我已经设置了主要组件并应用了样式。查看右侧预览以了解进度。`,
    `正在处理中。我已经创建了所需的文件并配置了布局。构建正在编译，你很快就能在预览中看到结果。`,
    `好的！我已经实现了你请求的更改。以下是我做的：搭建了组件层级结构，应用了样式，并确保所有内容都是响应式的。预览现在应该反映了这些更新。`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

const mockFiles = [
  { name: 'src', type: 'folder', children: [
    { name: 'App.tsx', type: 'file' },
    { name: 'main.tsx', type: 'file' },
    { name: 'index.css', type: 'file' },
  ]},
  { name: 'package.json', type: 'file' },
  { name: 'vite.config.ts', type: 'file' },
  { name: 'index.html', type: 'file' },
];

export default function DesignPage({ project, onBack }: DesignPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBuilding]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = () => {
    if (!input.trim() || isBuilding) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsBuilding(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateBotResponse(userMsg.content),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsBuilding(false);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deviceWidths: Record<DeviceMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left sidebar */}
      <div className={`shrink-0 border-r border-bolt-light-5 bg-bolt-light-2 flex flex-col transition-all duration-200 ${showFileTree ? 'w-[260px]' : 'w-0'}`}>
        {showFileTree && (
          <>
            {/* Back button */}
            <div className="h-14 flex items-center px-4 border-b border-bolt-light-5 gap-3">
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg text-bolt-light-9 hover:bg-bolt-light-4 transition-colors duration-150"
              >
                <ArrowLeft className="w-[18px] h-[18px]" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-bolt-light-12 truncate">{project.name}</div>
                <div className="text-[11px] text-bolt-light-7 truncate">个人空间</div>
              </div>
              <button className="p-1.5 rounded-lg text-bolt-light-9 hover:bg-bolt-light-4 transition-colors duration-150">
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
            </div>

            {/* File tree */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-2 px-2 text-[11px] font-medium text-bolt-light-7 tracking-wider">
                文件
              </div>
              {mockFiles.map((file) => (
                <div key={file.name}>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-bolt-light-9 hover:bg-bolt-light-3 transition-colors duration-100">
                    {file.type === 'folder' ? (
                      <ChevronDown className="w-3.5 h-3.5 text-bolt-light-7" />
                    ) : (
                      <Code2 className="w-3.5 h-3.5 text-bolt-light-7" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </button>
                  {file.children?.map((child) => (
                    <button
                      key={child.name}
                      className="w-full flex items-center gap-2 px-2 py-1.5 pl-8 rounded-md text-[13px] text-bolt-light-9 hover:bg-bolt-light-3 transition-colors duration-100"
                    >
                      <Code2 className="w-3.5 h-3.5 text-bolt-light-7" />
                      <span className="truncate">{child.name}</span>
                    </button>
                  ))}
                </div>
              ))}

              {/* Integrations */}
              <div className="mt-5 mb-2 px-2 text-[11px] font-medium text-bolt-light-7 tracking-wider">
                集成
              </div>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-bolt-light-9 hover:bg-bolt-light-3 transition-colors duration-100">
                <GitBranch className="w-3.5 h-3.5 text-bolt-light-7" />
                <span>GitHub</span>
                <span className="ml-auto text-[10px] text-bolt-light-7 bg-bolt-light-4 px-1.5 py-0.5 rounded">连接</span>
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-bolt-light-9 hover:bg-bolt-light-3 transition-colors duration-100">
                <Globe className="w-3.5 h-3.5 text-bolt-light-7" />
                <span>发布</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Chat panel */}
      <div className="w-[380px] shrink-0 border-r border-bolt-light-5 bg-bolt-light-2 flex flex-col">
        {/* Chat header */}
        <div className="h-14 flex items-center px-4 border-b border-bolt-light-5 gap-2">
          <button
            onClick={() => setShowFileTree(!showFileTree)}
            className="p-1.5 rounded-lg text-bolt-light-9 hover:bg-bolt-light-4 transition-colors duration-150"
          >
            <PanelLeft className="w-[18px] h-[18px]" />
          </button>
          <span className="text-[14px] font-semibold text-bolt-light-12">聊天</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-bolt-light-3 text-[11px] text-bolt-light-8 font-medium">
              <Sparkles className="w-3 h-3" />
              标准
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isBuilding && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-bolt-blue-light flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-bolt-blue" />
              </div>
              <h3 className="text-[15px] font-semibold text-bolt-light-12 mb-1">开始构建</h3>
              <p className="text-[13px] text-bolt-light-8 max-w-[260px]">
                描述你想要构建的内容，我来为你生成。
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-bolt-blue text-white rounded-br-md'
                    : 'bg-white border border-bolt-light-5 text-bolt-light-12 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isBuilding && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-white border border-bolt-light-5 rounded-2xl rounded-bl-md px-3.5 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-bolt-blue animate-spin" />
                <span className="text-[13px] text-bolt-light-8">构建中...</span>
                <div className="flex gap-1 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-bolt-blue/40 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-bolt-blue/40 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-bolt-blue/40 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-bolt-light-5">
          <div className="rounded-xl border border-bolt-light-5 bg-white focus-within:border-bolt-blue focus-within:shadow-sm transition-all duration-150">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="让 Bolt 帮你构建..."
              rows={1}
              className="w-full bg-transparent resize-none outline-none px-3.5 pt-3 pb-2 text-[13.5px] text-bolt-light-12 placeholder:text-bolt-light-7"
            />
            <div className="flex items-center justify-between px-2.5 pb-2.5">
              <div className="flex items-center gap-0.5">
                <button className="p-1.5 rounded-md text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-md text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150">
                  <AtSign className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-md text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150">
                  <Palette className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-md text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11 transition-colors duration-150">
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isBuilding}
                className={`p-1.5 rounded-md transition-all duration-150 ${
                  input.trim() && !isBuilding
                    ? 'bg-bolt-blue text-white hover:bg-bolt-blue-dark'
                    : 'bg-bolt-light-4 text-bolt-light-7 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview / Code panel */}
      <div className="flex-1 flex flex-col bg-bolt-light-3 min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-bolt-light-5 bg-white flex items-center px-4 gap-2">
          <div className="flex items-center gap-1 bg-bolt-light-3 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                viewMode === 'preview' ? 'bg-white text-bolt-light-12 shadow-sm' : 'text-bolt-light-8 hover:text-bolt-light-11'
              }`}
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
                viewMode === 'code' ? 'bg-white text-bolt-light-12 shadow-sm' : 'text-bolt-light-8 hover:text-bolt-light-11'
              }`}
            >
              <Code2 className="w-4 h-4" />
              代码
            </button>
          </div>

          {viewMode === 'preview' && (
            <div className="flex items-center gap-1 ml-2">
              {([
                { mode: 'desktop' as DeviceMode, icon: Monitor },
                { mode: 'tablet' as DeviceMode, icon: Tablet },
                { mode: 'mobile' as DeviceMode, icon: Smartphone },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setDeviceMode(mode)}
                  className={`p-1.5 rounded-md transition-colors duration-150 ${
                    deviceMode === mode ? 'bg-bolt-light-4 text-bolt-light-12' : 'text-bolt-light-7 hover:text-bolt-light-10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          {isBuilding && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-bolt-blue-light text-bolt-blue text-[12px] font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              构建中
            </div>
          )}

          {!isBuilding && messages.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-green-50 text-bolt-green text-[12px] font-medium">
              <Check className="w-3.5 h-3.5" />
              就绪
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bolt-light-5 text-[13px] font-medium text-bolt-light-9 hover:bg-bolt-light-3 transition-colors duration-150">
              <Globe className="w-4 h-4" />
              发布
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bolt-blue text-white text-[13px] font-medium hover:bg-bolt-blue-dark transition-colors duration-150">
              <Share2 className="w-4 h-4" />
              分享
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
          {viewMode === 'preview' ? (
            <div
              className="bg-white rounded-lg shadow-md border border-bolt-light-5 overflow-hidden transition-all duration-300"
              style={{ width: deviceWidths[deviceMode], maxWidth: '100%', height: '100%' }}
            >
              <div className="h-full flex flex-col items-center justify-center bolt-grid-bg p-8">
                {messages.length === 0 ? (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-3xl bg-bolt-light-3 flex items-center justify-center mx-auto mb-5">
                      <Sparkles className="w-10 h-10 text-bolt-light-7" />
                    </div>
                    <h2 className="text-xl font-bold text-bolt-light-12 mb-2">预览将显示在这里</h2>
                    <p className="text-bolt-light-8 text-sm max-w-xs">
                      在聊天中发送消息以开始构建你的项目。
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-md text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl bg-bolt-blue flex items-center justify-center mx-auto mb-5 bolt-glow">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-bolt-light-12 mb-2">{project.name}</h2>
                    <p className="text-bolt-light-8 text-sm">{project.description}</p>
                    <div className="mt-6 p-6 rounded-xl border border-bolt-light-5 bg-white text-left">
                      <div className="space-y-3">
                        <div className="h-3 rounded-full bg-bolt-light-4 w-full" />
                        <div className="h-3 rounded-full bg-bolt-light-4 w-5/6" />
                        <div className="h-3 rounded-full bg-bolt-light-4 w-4/6" />
                        <div className="h-20 rounded-lg bg-bolt-light-3 mt-4" />
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="h-16 rounded-lg bg-bolt-light-3" />
                          <div className="h-16 rounded-lg bg-bolt-light-3" />
                        </div>
                        <div className="h-10 rounded-lg bg-bolt-blue mt-4" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-white rounded-lg shadow-md border border-bolt-light-5 overflow-hidden flex flex-col">
              <div className="h-10 border-b border-bolt-light-5 bg-bolt-light-2 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-bolt-red/70" />
                  <div className="w-3 h-3 rounded-full bg-bolt-yellow/70" />
                  <div className="w-3 h-3 rounded-full bg-bolt-green/70" />
                </div>
                <span className="text-[12px] text-bolt-light-8 ml-2 font-mono">src/App.tsx</span>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed">
                <pre className="text-bolt-light-11"><code>{`import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          ${project.name}
        </h1>
        <p className="text-gray-600 mt-2">
          ${project.description}
        </p>
        <button
          onClick={() => setCount(c => c + 1)}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          点击了 {count} 次
        </button>
      </div>
    </div>
  );
}

export default App;`}</code></pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
