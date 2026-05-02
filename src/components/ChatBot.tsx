
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Sprout, your environmental assistant. Ask me about air quality, sustainability tips, or farming advice!"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const recentMessages = messages.slice(-5);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          max_tokens: 150,
          temperature: 0.6,
          messages: [
            {
              role: "system",
              content: "You are Sprout, an environmental AI assistant inside the Earthly app.\n\nRules:\n- Keep responses SHORT (3–6 lines max)\n- Be clear, helpful, and direct\n- NO hashtags at all\n- Use emojis very rarely (max 1, only if truly needed)\n- Do NOT behave like social media or marketing content\n- Avoid fluff, repetition, and long introductions\n- Focus on giving practical, useful answers\n\nYou should still include environmental awareness when relevant, but do it naturally, not forcefully."
            },
            ...recentMessages,
            userMessage
          ]
        })
      });

      if (!response.ok) {
        throw new Error("API response error");
      }

      const data = await response.json();
      let assistantReply = data.choices?.[0]?.message?.content?.trim() || "I'm having trouble thinking right now. Please try again later.";
      
      if (assistantReply.length > 500) {
        assistantReply = assistantReply.substring(0, 500) + "...";
      }

      setMessages(prev => [...prev, { role: "assistant", content: assistantReply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Oops, something went wrong on my end. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 float-animation ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card 
          className={`fixed bottom-6 right-6 z-50 shadow-xl border-0 overflow-hidden fade-in flex flex-col transition-all duration-300 ${
            isExpanded ? "w-[90vw] h-[80vh] sm:w-[500px] sm:h-[600px] max-w-[600px] max-h-[800px]" : "w-80 h-96"
          }`}
        >
          {/* Chat Header */}
          <div className="bg-gradient-primary text-white p-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-semibold">Sprout</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-2"
                      : "bg-secondary text-secondary-foreground mr-2"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-lg text-sm bg-secondary text-secondary-foreground mr-2 opacity-70 animate-pulse">
                  Sprout is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border shrink-0 bg-background">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the environment..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                size="sm"
                className="bg-primary hover:bg-primary/90 shrink-0"
                disabled={loading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
