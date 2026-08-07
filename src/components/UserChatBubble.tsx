import { useEffect, useState } from 'react';
import { Copy, Pencil } from 'lucide-react';

interface UserChatBubbleProps {
  content: string;
  timestamp: string;
  onResend: (nextContent: string) => void;
  onCopied?: () => void;
}

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const period = hours < 12 ? '上午' : '下午';
  const hour12 = hours % 12 || 12;
  return `${month}月${day}日 ${period}${hour12}:${minutes}`;
}

export default function UserChatBubble({ content, timestamp, onResend, onCopied }: UserChatBubbleProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    if (editing) setDraft(content);
  }, [editing, content]);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // demo: still acknowledge
    }
    onCopied?.();
  };

  const confirmEdit = () => {
    const next = draft.trim();
    if (!next) return;
    onResend(next);
    setEditing(false);
  };

  return (
    <>
      <div
        className="group flex justify-end"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex max-w-[88%] flex-col items-end gap-1.5">
          <div className="rounded-2xl rounded-br-md bg-bolt-blue px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white whitespace-pre-wrap">
            {content}
          </div>
          <div
            className={`flex items-center gap-2.5 pr-0.5 transition-opacity duration-150 ${
              hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              type="button"
              aria-label="复制"
              onClick={copyContent}
              className="rounded-md p-1 text-bolt-light-7 hover:bg-bolt-light-4 hover:text-bolt-light-10"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="修改"
              onClick={() => setEditing(true)}
              className="rounded-md p-1 text-bolt-light-7 hover:bg-bolt-light-4 hover:text-bolt-light-10"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-bolt-light-7">{formatMessageTime(timestamp)}</span>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/35 p-4" onClick={() => setEditing(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-message-title"
            className="w-full max-w-[440px] rounded-2xl bg-white p-5 shadow-2xl animate-fade-in"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="edit-message-title" className="text-[16px] font-bold text-bolt-light-12">
              修改并重新发送？
            </h3>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              autoFocus
              className="mt-4 w-full resize-none rounded-xl border border-bolt-light-5 bg-white px-3.5 py-3 text-[13px] leading-relaxed text-bolt-light-12 outline-none focus:border-bolt-blue"
            />
            <p className="mt-3 text-[12px] leading-relaxed text-bolt-light-8">
              这条消息会更新为新内容，其后的对话将被回退，AI 会从这里重新回复。
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-[13px] font-medium text-bolt-light-9 hover:text-bolt-light-11"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmEdit}
                disabled={!draft.trim()}
                className="rounded-full border border-bolt-light-5 px-4 py-1.5 text-[13px] font-medium text-bolt-light-11 hover:bg-bolt-light-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                修改并重新发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
