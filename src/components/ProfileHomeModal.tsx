import { useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { loadPublishedPlazaApps, removePublishedPlazaApp, type PublishedPlazaApp } from '@/lib/plazaPublishing';

interface ProfileHomeModalProps {
  open: boolean;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onClose: () => void;
}

const TABS = ['上架作品', '赞过的', '足迹'] as const;

export default function ProfileHomeModal({
  open,
  displayName,
  onDisplayNameChange,
  onClose,
}: ProfileHomeModalProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('上架作品');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [publishedApps, setPublishedApps] = useState<PublishedPlazaApp[]>([]);

  useEffect(() => {
    const refresh = () => setPublishedApps(loadPublishedPlazaApps());
    refresh();
    window.addEventListener('yingmi-plaza-published', refresh);
    window.addEventListener('yingmi-plaza-unpublished', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('yingmi-plaza-published', refresh);
      window.removeEventListener('yingmi-plaza-unpublished', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setNameDraft(displayName);
      setEditingName(false);
    }
  }, [open, displayName]);

  if (!open) return null;

  const commitName = () => {
    const next = nameDraft.trim();
    if (next) onDisplayNameChange(next);
    else setNameDraft(displayName);
    setEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-home-title"
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-in"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/20 p-1.5 text-white hover:bg-black/30"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-[#6b7ba8] px-5 pb-8 pt-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-[#1a1a1a] text-white">
              <span className="block h-0.5 w-8 rounded-full bg-white" />
            </div>

            <div className="min-w-0 flex-1 pt-1">
              {editingName ? (
                <input
                  id="profile-home-title"
                  autoFocus
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  onBlur={commitName}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      commitName();
                    } else if (event.key === 'Escape') {
                      setNameDraft(displayName);
                      setEditingName(false);
                    }
                  }}
                  className="w-full max-w-[220px] rounded-md border border-white/40 bg-white/15 px-2 py-1 text-[16px] font-bold text-white outline-none placeholder:text-white/60"
                />
              ) : (
                <div className="flex min-w-0 items-center gap-2">
                  <h2 id="profile-home-title" className="truncate text-[17px] font-bold text-white">
                    {displayName}
                  </h2>
                  <button
                    type="button"
                    aria-label="修改用户名"
                    onClick={() => {
                      setNameDraft(displayName);
                      setEditingName(true);
                    }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/35"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="mt-3 flex items-center gap-5 text-white">
                <div className="text-center">
                  <div className="text-[18px] font-bold leading-none">0</div>
                  <div className="mt-1 text-[11px] text-white/85">关注</div>
                </div>
                <div className="h-7 w-px bg-white/35" />
                <div className="text-center">
                  <div className="text-[18px] font-bold leading-none">0</div>
                  <div className="mt-1 text-[11px] text-white/85">粉丝</div>
                </div>
                <div className="h-7 w-px bg-white/35" />
                <div className="text-center">
                  <div className="text-[18px] font-bold leading-none">3</div>
                  <div className="mt-1 text-[11px] text-white/85">获赞</div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[12.5px] text-white/80">该用户还没有简介～</p>
        </div>

        <div className="-mt-4 rounded-t-[28px] bg-white px-5 pb-5 pt-4">
          <div className="flex items-center gap-6 border-b border-bolt-light-4">
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-2.5 text-[14px] transition-colors ${
                    active ? 'font-semibold text-bolt-blue' : 'font-medium text-bolt-light-8'
                  }`}
                >
                  {tab}
                  {active && (
                    <span className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-bolt-blue" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 min-h-[220px]">
            {activeTab === '上架作品' ? (
              publishedApps.filter((app) => app.author === displayName).length > 0 ? (
                <div className="space-y-4">
                  {publishedApps.filter((app) => app.author === displayName).map((app) => (
                    <article key={app.id} className="overflow-hidden">
                      <div className="rounded-xl border border-bolt-light-5 bg-gradient-to-br from-[#eef3fb] to-[#f7f9fc] p-3">
                        <div className="h-28 overflow-hidden rounded-lg bg-bolt-light-3">
                          {app.cover ? <img src={app.cover} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-[13.5px] font-semibold text-bolt-light-12">{app.title}</h4>
                          <div className="mt-1 text-[11px] text-bolt-light-7">已上架到应用广场</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`确定将「${app.title}」下线吗？下线后不会删除工作空间中的原项目。`)) {
                              removePublishedPlazaApp(app.id);
                            }
                          }}
                          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-bolt-red hover:bg-red-50"
                        >
                          下线应用
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-[13px] text-bolt-light-7">暂无上架作品</div>
              )
            ) : (
              <div className="flex h-[200px] items-center justify-center text-[13px] text-bolt-light-7">
                暂无内容
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
