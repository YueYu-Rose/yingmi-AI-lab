import { type ReactNode } from 'react';
import { ArrowUp, Pencil } from 'lucide-react';

export function EditableBlock({
  id,
  tag = 'DIV',
  editMode,
  selectedId,
  onSelect,
  children,
  className = '',
}: {
  id: string;
  tag?: string;
  editMode: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  children: ReactNode;
  className?: string;
}) {
  if (!editMode) {
    return <div className={className}>{children}</div>;
  }

  const selected = selectedId === id;
  return (
    <div
      role="button"
      tabIndex={0}
      data-editable-block={id}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(id);
        }
      }}
      className={`relative cursor-pointer rounded-xl transition-shadow ${selected ? 'ring-2 ring-bolt-blue shadow-[0_0_0_4px_rgba(19,128,253,0.12)]' : 'hover:ring-2 hover:ring-dashed hover:ring-bolt-blue/50'} ${className}`}
    >
      <span className={`absolute -top-2 left-2 z-20 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white ${selected ? 'bg-bolt-blue' : 'bg-bolt-blue/70'}`}>
        {tag}
      </span>
      {children}
    </div>
  );
}

export function previewBlockLabel(selectedId: string | null) {
  if (!selectedId) return null;
  if (selectedId.startsWith('metric:')) return selectedId.replace('metric:', '');
  if (selectedId.startsWith('chart:')) return '收益走势图';
  if (selectedId.startsWith('table:')) return '数据表格';
  if (selectedId.startsWith('summary:')) return '分析摘要';
  return selectedId;
}

export function PreviewChrome({
  editMode,
  onEditModeChange,
  selectedLabel,
  comment,
  onCommentChange,
  onSubmitComment,
  isSubmitting,
  children,
}: {
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
  selectedLabel: string | null;
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  isSubmitting: boolean;
  children: ReactNode;
}) {
  return (
    <div data-testid="preview-frame" className="relative flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-bolt-light-5 bg-white px-3">
        <span className="rounded-md bg-bolt-light-3 px-2 py-1 font-mono text-[11px] text-bolt-light-8">/首页</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEditModeChange(!editMode)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-bolt-blue px-3 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-bolt-blue-dark"
          >
            <Pencil className="h-3.5 w-3.5" />
            {editMode ? '编辑中' : '编辑'}
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {children}

        {editMode && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
            <div className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-bolt-light-5 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
              <Pencil className="h-4 w-4 shrink-0 text-bolt-blue" />
              <input
                value={comment}
                onChange={(event) => onCommentChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    onSubmitComment();
                  }
                }}
                placeholder={selectedLabel ? `针对「${selectedLabel}」告诉盈米你的修改需求…` : '先点选一个组件，再留言给 AI…'}
                disabled={!selectedLabel || isSubmitting}
                className="min-w-0 flex-1 bg-transparent text-[13px] text-bolt-light-12 outline-none placeholder:text-bolt-light-7 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={onSubmitComment}
                disabled={!selectedLabel || !comment.trim() || isSubmitting}
                aria-label="发送组件留言"
                className={`rounded-full p-1.5 ${selectedLabel && comment.trim() && !isSubmitting ? 'bg-bolt-blue text-white hover:bg-bolt-blue-dark' : 'cursor-not-allowed bg-bolt-light-4 text-bolt-light-7'}`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
