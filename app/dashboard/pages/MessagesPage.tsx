import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';

const CONVERSATIONS = [
  { id: 1, name: "Mphatso Banda",   last: "Is this still available?",          time: "2h", unread: 2, avatar: "MB" },
  { id: 2, name: "Grace Phiri",     last: "Thank you for the quick response!",  time: "5h", unread: 0, avatar: "GP" },
  { id: 3, name: "James Chirwa",    last: "I'll come for pickup tomorrow.",      time: "1d", unread: 1, avatar: "JC" },
  { id: 4, name: "Thandiwe Mwale",  last: "Can we schedule a viewing Friday?",  time: "3h", unread: 0, avatar: "TM" },
];

const MOCK_MSGS = [
  { id: 1, from: "them", text: "Hello! Is the Toyota Hiace mirror still in stock?", time: "10:02 AM" },
  { id: 2, from: "me",   text: "Yes, we have 4 units available. Price is K8,500 each.", time: "10:05 AM" },
  { id: 3, from: "them", text: "Great! I'm in Blantyre — can you arrange delivery?", time: "10:07 AM" },
  { id: 4, from: "me",   text: "We can arrange delivery for an extra K2,000. Interested?", time: "10:10 AM" },
  { id: 5, from: "them", text: "Is this still available?", time: "12:34 PM" },
];

interface MessagesPageProps {
  color: string;
}

export function MessagesPage({ color }: MessagesPageProps) {
  const [active, setActive] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [showChat, setShowChat] = useState(false);

  const handleSelectConversation = (id: number) => {
    setActive(id);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
  };

  return (
    <PageShell title="Messages" subtitle="Your conversations" color={color}>
      {/* Mobile View */}
      <div className="block lg:hidden h-[calc(100vh-180px)]">
        {!showChat ? (
          // Conversation List View
          <div className="flex flex-col gap-2 h-full overflow-y-auto">
            {CONVERSATIONS.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => handleSelectConversation(conv.id)}
                className="rounded-xl p-3 cursor-pointer transition-all flex items-center gap-3"
                style={{
                  background: "var(--bg-secondary, #132333)",
                  border: "1px solid var(--border-color, rgba(255,255,255,0.07))",
                }}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: `${color}20`, color }}>
                    {conv.avatar}
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{ background: color, color: "#0d1f2d" }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{conv.name}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{conv.time}</span>
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{conv.last}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Chat View for Mobile
          <div className="flex flex-col h-full rounded-xl" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
            {active && (() => {
              const conv = CONVERSATIONS.find(c => c.id === active)!;
              return (
                <>
                  <div className="p-3 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
                    <button 
                      onClick={handleBackToList}
                      className="p-1 rounded-lg transition-all hover:bg-white/10"
                    >
                      <ArrowLeft size={20} style={{ color: "var(--text-primary, white)" }} />
                    </button>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black"
                      style={{ background: `${color}20`, color }}>
                      {conv.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{conv.name}</div>
                      <div className="text-[10px]" style={{ color: "#10b981" }}>● Online</div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                    {MOCK_MSGS.map(m => (
                      <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[85%]">
                          <div className="text-sm px-3 py-2 rounded-xl"
                            style={{
                              background: m.from === "me" ? color : "var(--bg-elevated, #1a2e42)",
                              color: m.from === "me" ? "#ffffff" : "var(--text-primary, white)",
                              border: m.from === "me" ? "none" : "1px solid var(--border-color, rgba(255,255,255,0.07))",
                              borderRadius: m.from === "me" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                            }}>
                            {m.text}
                          </div>
                          <div className="text-[9px] mt-1 px-1" style={{ color: "var(--text-secondary, #8ca5bc)", textAlign: m.from === "me" ? "right" : "left" }}>{m.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 flex gap-2 items-center" style={{ borderTop: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
                    <input
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))", color: "var(--text-primary, white)" }}
                      onKeyDown={e => e.key === "Enter" && setMsg("")}
                    />
                    <button
                      onClick={() => setMsg("")}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-90"
                      style={{ background: color, color: "#ffffff" }}>
                      <Send size={15} />
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Desktop/Tablet View */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 h-[520px]">
        <div className="lg:col-span-2 flex flex-col gap-2 overflow-y-auto">
          {CONVERSATIONS.map(conv => (
            <div key={conv.id} onClick={() => setActive(conv.id)}
              className="rounded-xl p-3 cursor-pointer transition-all flex items-center gap-3"
              style={{
                background: active === conv.id ? `${color}12` : "var(--bg-secondary, #132333)",
                border: `1px solid ${active === conv.id ? color + "40" : "var(--border-color, rgba(255,255,255,0.07))"}`,
              }}>
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black"
                  style={{ background: `${color}20`, color }}>
                  {conv.avatar}
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                    style={{ background: color, color: "#0d1f2d" }}>
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{conv.name}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{conv.time}</span>
                </div>
                <div className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{conv.last}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 rounded-xl flex flex-col" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
          {active ? (() => {
            const conv = CONVERSATIONS.find(c => c.id === active)!;
            return (
              <>
                <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black"
                    style={{ background: `${color}20`, color }}>
                    {conv.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{conv.name}</div>
                    <div className="text-[10px]" style={{ color: "#10b981" }}>● Online</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {MOCK_MSGS.map(m => (
                    <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[75%]">
                        <div className="text-sm px-3 py-2 rounded-xl"
                          style={{
                            background: m.from === "me" ? color : "var(--bg-elevated, #1a2e42)",
                            color: m.from === "me" ? "#ffffff" : "var(--text-primary, white)",
                            border: m.from === "me" ? "none" : "1px solid var(--border-color, rgba(255,255,255,0.07))",
                            borderRadius: m.from === "me" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                          }}>
                          {m.text}
                        </div>
                        <div className="text-[9px] mt-1 px-1" style={{ color: "var(--text-secondary, #8ca5bc)", textAlign: m.from === "me" ? "right" : "left" }}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 flex gap-2 items-center" style={{ borderTop: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
                  <input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))", color: "var(--text-primary, white)" }}
                    onKeyDown={e => e.key === "Enter" && setMsg("")}
                  />
                  <button
                    onClick={() => setMsg("")}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-90"
                    style={{ background: color, color: "#ffffff" }}>
                    <Send size={15} />
                  </button>
                </div>
              </>
            );
          })() : (
            <div className="flex-1 flex items-center justify-center flex-col gap-2">
              <MessageSquare size={28} style={{ color: "var(--text-secondary, #8ca5bc)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary, #8ca5bc)" }}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}