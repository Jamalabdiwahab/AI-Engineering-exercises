"use client";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState('');
  const { messages, sendMessage, status } = useChat();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* header */}
      <div className="text-center py-6 border-b">
        <h1 className="text-3xl font-bold mb-2">🎬 Movie Assistant</h1>
        <p className="text-gray-600">Search movies • Query MongoDB • Tell jokes</p>
      </div>

      {/* chat messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {
                  message.parts.map((part, index) => {
                    switch (part.type) {
                      case 'text':
                        return <div key={index}>{part.text}</div>;
                      case "tool-database":
                        return null;
                        // return (
                        //   <pre key={index} className="mt-2 text-sm bg-gray-100 p-2 rounded">
                        //     {JSON.stringify(part.output, null, 2)}
                        //   </pre>
                        // )
                      case "tool-movieSearch":
                        return null;
                        // return (
                        //   <pre key={index} className="mt-2 text-sm bg-gray-100 p-2 rounded">
                        //     {JSON.stringify(part.output, null, 2)}
                        //   </pre>
                        // )
                      case "tool-joke":
                        return(
                          <div key={index}>😂 {String(part.output)}</div>
                        )
                      default:
                        return null;
                    }
                  })
                }
              </div>
            </div>
          ))}
          {
            status === "streaming" && (
              <p className="text-gray-500">
                Assistant is typing...
              </p>
            )
          }
          <div ref={bottomRef} />
        </div>
      </div>

      {/* fixed input at the bottom */}
      <div className="border-t bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputText.trim()) return;
            sendMessage({ text: inputText });
            setInputText('');
          }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about movies, users, or jokes..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={status === "streaming"}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {status === "streaming" ? "Thinking..." : "Send"}
          </button>
          </div>
        </form>
      </div>
        
    </div>
  );
}
