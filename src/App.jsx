import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css'

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
      const res = await axios.post(import.meta.env.VITE_API_URL, {
        userInput,
        conversationHistory: messages,
      });

      const newAIMessage = {
        role: 'assistant',
        content: res.data.response
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
            <pre key={index} className="bg-gray-800 p-3 rounded-lg mt-2 mb-2 overflow-x-auto">
              <code className="font-mono text-sm">{code}</code>
            </pre>
          );
        }
        // Regular text
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-sans">LeetAid</h1>
            <p className="text-sm text-gray-400 font-sans">Small Hints for Big Breakthroughs!</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isLoading && (
            <div className="text-blue-400 text-sm flex items-center font-sans">
              <div className="animate-pulse mr-2">●</div>
              Processing
            </div>
          )}
          <button
            onClick={handleClearConversation}
            className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-gray-700 font-sans"
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
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg mx-auto max-w-md font-sans">
              {error}
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[85%] md:max-w-[70%] ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none' 
                  : 'bg-gray-700 text-gray-100 rounded-2xl rounded-tl-none'
              } px-4 py-2 shadow-lg`}>
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
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full bg-gray-700 text-gray-100 rounded-xl px-4 py-3 pr-16 resize-none border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors min-h-[100px] placeholder-gray-400 font-sans text-base"
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
                  isLoading || !userInput.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
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