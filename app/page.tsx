"use client";

import { useEffect, useMemo, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
};

type ClientProfile = {
  id: string;
  name: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Home() {
  // Example agencies/clients scaffold
  const clients: ClientProfile[] = useMemo(
    () => [
      { id: "c1", name: "Greyhouse — Client A" },
      { id: "c2", name: "Greyhouse — Client B" },
      { id: "c3", name: "Greyhouse — Client C" },
    ],
    []
  );

  const [activeClientId, setActiveClientId] = useState<string>(clients[0].id);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Store chat per-client in state + localStorage
  const [messagesByClient, setMessagesByClient] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    // hydrate from localStorage
    const raw = localStorage.getItem("prai_chat_by_client");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setMessagesByClient(parsed);
      } catch {
        // ignore
      }
    } else {
      // seed welcome message once
      const seed: Record<string, Message[]> = {};
      for (const c of clients) {
        seed[c.id] = [
          {
            id: "seed-" + c.id,
            role: "assistant",
            content:
              "Welcome to PRAI. Select a client on the left and ask anything—I'll curate influencers, surface insights, and remember context for this client.",
            ts: Date.now(),
          },
        ];
      }
      setMessagesByClient(seed);
    }
  }, [clients]);

  useEffect(() => {
    // persist to localStorage
    localStorage.setItem("prai_chat_by_client", JSON.stringify(messagesByClient));
  }, [messagesByClient]);

  const activeMessages = messagesByClient[activeClientId] || [];

  function pushMessage(clientId: string, msg: Message) {
    setMessagesByClient((prev) => ({
      ...prev,
      [clientId]: [...(prev[clientId] || []), msg],
    }));
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      ts: Date.now(),
    };
    pushMessage(activeClientId, userMsg);

    setSending(true);

    // Try hitting your backend /chat endpoint. If it fails, gracefully fall back.
    // You’ll wire the real AI brain later. For now: safe fallback response.
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: activeClientId,
          message: text,
        }),
      });

      let assistantText = "";
      if (res.ok) {
        // Expecting { reply: string }
        const data = await res.json().catch(() => ({}));
        assistantText =
          typeof data.reply === "string" && data.reply.length > 0
            ? data.reply
            : "Thanks — I’ve received your message. The AI engine will reply here once connected.";
      } else {
        assistantText =
          "Your backend responded, but the /chat route isn’t set up yet. I’ll echo your message for now.";
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: assistantText,
        ts: Date.now(),
      };
      pushMessage(activeClientId, assistantMsg);
    } catch {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I couldn’t reach the backend. I’ll keep your message saved to this client. Once the AI endpoint is live, I’ll reply here.",
        ts: Date.now(),
      };
      pushMessage(activeClientId, assistantMsg);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="main-wrap">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="agency">Agency: <strong>Greyhouse</strong></div>
          <div className="sidebar-label">Clients</div>
        </div>

        <ul className="client-list">
          {clients.map((c) => (
            <li
              key={c.id}
              className={`client-item ${c.id === activeClientId ? "active" : ""}`}
              onClick={() => setActiveClientId(c.id)}
              title={`Switch chat context to ${c.name}`}
            >
              <span className="dot" />
              <span className="client-name">{c.name}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="ghost-btn">+ New Client</button>
          <button className="ghost-btn">Invite Team</button>
        </div>
      </aside>

      <section className="chat-pane">
        <div className="chat-card">
          <div className="chat-header">
            <div className="chat-title">{clients.find((c) => c.id === activeClientId)?.name}</div>
            <div className="chat-subtle">Single chat history scoped to this client.</div>
          </div>

          <div className="chat-scroll">
            {activeMessages.map((msg) => {
              const fromAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`bubble-row ${fromAssistant ? "left" : "right"}`}
                >
                  <div
                    className="bubble"
                    style={{
                      background: fromAssistant ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.16)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                      borderRadius: fromAssistant ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                      padding: "0.75rem 1rem",
                      maxWidth: "80%",
                      fontSize: "0.95rem",
                      lineHeight: 1.45,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="composer">
            <input
              className="input"
              placeholder="Ask PRAI to curate creators, analyze a list, draft outreach, etc."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button className="send-btn" onClick={handleSend} disabled={sending}>
              {sending ? "…" : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
