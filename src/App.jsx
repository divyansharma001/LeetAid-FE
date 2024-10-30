import React, { useState, useRef, useEffect } from 'react';
import { Github } from 'lucide-react';

function App() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError('');

    const newUserMessage = {
      role: 'user',
      content: userInput
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    try {
      const res = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          conversationHistory: messages,
        }),
      });
      
      const data = await res.json();
      const newAIMessage = {
        role: 'assistant',
        content: data.response
      };
      
      setMessages(prev => [...prev, newAIMessage]);
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    localStorage.removeItem('messages');
  };

  const formatMessageContent = (content) => {
    if (content.includes('```')) {
      const parts = content.split(/(```[\s\S]*?```)/);
      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3);
          return (
            <pre key={index} className="bg-gray-900 p-4 rounded-lg mt-2 mb-2 overflow-x-auto border border-gray-700">
              <code className="font-mono text-sm text-gray-200">{code}</code>
            </pre>
          );
        }
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      });
    }
    return content;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-sans tracking-tight">LeetAid</h1>
            <p className="text-sm text-indigo-200 font-sans">Small Hints for Big Breakthroughs!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/divyansharma001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors duration-200 border border-gray-700"
          >
            <Github size={20} />
            <span className="hidden sm:inline">Follow on GitHub</span>
          </a>
          
          {isLoading && (
            <div className="text-indigo-400 text-sm flex items-center font-sans">
              <div className="animate-pulse mr-2">●</div>
              Processing
            </div>
          )}
          
          <button
            onClick={handleClearConversation}
            className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800 font-sans border border-gray-800 hover:border-gray-700"
          >
            Clear Chat
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg mx-auto max-w-md font-sans">
              {error}
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[85%] md:max-w-[70%] ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none shadow-blue-500/20' 
                  : 'bg-gray-800/80 text-gray-100 rounded-2xl rounded-tl-none shadow-gray-900/30'
              } px-6 py-3 shadow-lg backdrop-blur-sm border border-gray-700`}>
                <div className={`text-base leading-relaxed font-sans ${
                  msg.role === 'assistant' ? 'text-gray-100' : 'text-white'
                }`}>
                  {formatMessageContent(msg.content)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full bg-gray-800 text-gray-100 rounded-xl px-6 py-4 pr-16 resize-none border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors min-h-[120px] placeholder-gray-400 font-sans text-base shadow-lg"
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className={`absolute right-3 bottom-3 p-3 rounded-lg transition-all ${
                  isLoading || !userInput.trim()
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;