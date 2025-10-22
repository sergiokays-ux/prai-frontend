"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setResponse(data.reply || "No response from AI");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">PRAI Chatbot 🤖</h1>

      <div className="w-full max-w-md space-y-4">
        <textarea
          className="w-full p-3 border rounded"
          rows={4}
          placeholder="Ask me something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Send
        </button>

        {response && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <p>{response}</p>
          </div>
        )}
      </div>
    </main>
  );
}
