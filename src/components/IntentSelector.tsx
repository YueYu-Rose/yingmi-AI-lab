import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

export interface IntentOption {
  id: string;
  title: string;
  description: string;
}

interface IntentSelectorProps {
  question: string;
  options: IntentOption[];
  onSubmit: (value: { optionId: string; title: string; customText?: string }) => void;
  onSkip?: () => void;
}

export default function IntentSelector({ question, options, onSubmit, onSkip }: IntentSelectorProps) {
  const [selectedId, setSelectedId] = useState(options[0]?.id ?? 'custom');
  const [customText, setCustomText] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const canSubmit = selectedId !== 'custom' || customText.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (selectedId === 'custom') {
      onSubmit({ optionId: 'custom', title: customText.trim(), customText: customText.trim() });
      return;
    }
    const option = options.find((item) => item.id === selectedId);
    if (!option) return;
    onSubmit({ optionId: option.id, title: option.title });
  };

  return (
    <div data-testid="intent-selector" className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-bolt-light-5 bg-white shadow-sm animate-slide-up">
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="flex w-full items-start gap-3 border-b border-bolt-light-5 bg-bolt-light-2 px-4 py-3.5 text-left"
      >
        <p className="min-w-0 flex-1 text-[14px] font-semibold leading-relaxed text-bolt-light-12">
          {question}
        </p>
        <ChevronsUpDown className="mt-0.5 h-4 w-4 shrink-0 text-bolt-light-7" />
      </button>

      {!collapsed && (
        <>
          <div className="divide-y divide-bolt-light-4">
            {options.map((option) => {
              const selected = selectedId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${selected ? 'bg-bolt-light-3' : 'bg-white hover:bg-bolt-light-2'}`}
                >
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-bolt-blue' : 'border-bolt-light-6'}`}>
                    {selected && <span className="h-2 w-2 rounded-full bg-bolt-blue" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-bolt-light-12">{option.title}</span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-bolt-light-8">{option.description}</span>
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setSelectedId('custom')}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${selectedId === 'custom' ? 'bg-bolt-light-3' : 'bg-white hover:bg-bolt-light-2'}`}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selectedId === 'custom' ? 'border-bolt-blue' : 'border-bolt-light-6'}`}>
                {selectedId === 'custom' && <span className="h-2 w-2 rounded-full bg-bolt-blue" />}
              </span>
              <input
                value={customText}
                onChange={(event) => {
                  setCustomText(event.target.value);
                  setSelectedId('custom');
                }}
                onClick={() => setSelectedId('custom')}
                placeholder="自己写一写..."
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-bolt-light-12 outline-none placeholder:text-bolt-light-7"
              />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-bolt-light-5 px-3 py-2.5">
            <div className="flex items-center gap-1 text-bolt-light-6">
              <span className="rounded-md p-1.5">
                <ChevronLeft className="h-4 w-4" />
              </span>
              <span className="rounded-md p-1.5">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-bolt-light-8 hover:bg-bolt-light-3 hover:text-bolt-light-11"
                >
                  跳过
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold text-white ${canSubmit ? 'bg-bolt-blue hover:bg-bolt-blue-dark' : 'cursor-not-allowed bg-bolt-light-6'}`}
              >
                提交
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
