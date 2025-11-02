import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Wrench, Send, Trash2, Plus, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { chatService, formatTime, renderToolCall, MODELS } from '@/lib/chat';
import type { ChatState, Message, ToolCall } from '../../worker/types';
import { cn } from '@/lib/utils';
import { useSignalStore, Signal } from '@/store/signalStore';
export function ChatPanel() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const updateSignal = useSignalStore((state) => state.updateSignal);
  const addTrade = useSignalStore((state) => state.addTrade);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.streamingMessage]);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({
        ...prev,
        ...response.data,
        sessionId: chatService.getSessionId()
      }));
    }
  }, []);
  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);
  // Effect to process new messages and update the signal store
  useEffect(() => {
    const lastMessage = chatState.messages[chatState.messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.toolCalls) {
      for (const toolCall of lastMessage.toolCalls) {
        if (toolCall.name === 'get_market_data_and_signal' && toolCall.result) {
          const signalData = toolCall.result as Omit<Signal, 'timestamp'>;
          if (signalData.pair && signalData.signal && signalData.price) {
            updateSignal(signalData);
          }
        }
        if (toolCall.name === 'execute_trade_signal' && toolCall.result) {
          const tradeData = toolCall.result as any;
          if (tradeData.success !== undefined) {
            addTrade({
              pair: tradeData.pair,
              action: tradeData.action,
              amount: tradeData.amount,
              price: tradeData.price,
              status: tradeData.success ? 'SUCCESS' : 'FAILED',
            });
          }
        }
      }
    }
  }, [chatState.messages, updateSignal, addTrade]);
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    setIsLoading(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      streamingMessage: ''
    }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    await loadCurrentSession();
    setIsLoading(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const handleClear = async () => {
    await chatService.clearMessages();
    setChatState(prev => ({ ...prev, messages: [], streamingMessage: '' }));
  };
  const handleNewSession = async () => {
    chatService.newSession();
    setChatState({
      messages: [],
      sessionId: chatService.getSessionId(),
      isProcessing: false,
      model: chatState.model,
      streamingMessage: ''
    });
  };
  const handleModelChange = async (model: string) => {
    await chatService.updateModel(model);
    setChatState(prev => ({ ...prev, model }));
  };
  return (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-gray-900/30 backdrop-blur-sm">
        <div className="flex-shrink-0 border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">AI Trade Assistant</h2>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white" onClick={handleNewSession}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chat</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-white" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear Chat</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <Select value={chatState.model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-full rounded-md border-white/10 bg-gray-900/50 text-white focus:ring-indigo-500">
                <SelectValue placeholder="Select AI Model" />
              </SelectTrigger>
              <SelectContent className="border-white/20 bg-gray-900 text-white">
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="focus:bg-indigo-600/50">
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-6">
            {chatState.messages.length === 0 && !chatState.streamingMessage && (
              <div className="text-center text-gray-400 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Ask for market analysis or a trading signal.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline" className="cursor-pointer border-white/20 text-gray-300 hover:bg-white/10" onClick={() => setInput('Analyze EUR/USD')}>Analyze EUR/USD</Badge>
                  <Badge variant="outline" className="cursor-pointer border-white/20 text-gray-300 hover:bg-white/10" onClick={() => setInput('Signal for BTC/USD?')}>Signal for BTC/USD?</Badge>
                </div>
              </div>
            )}
            {chatState.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn('flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'assistant' && <Bot className="h-6 w-6 flex-shrink-0 rounded-full bg-indigo-600 p-1 text-white" />}
                <div className={cn('max-w-[85%] rounded-2xl px-4 py-3', msg.role === 'user' ? 'rounded-br-none bg-indigo-600 text-white' : 'rounded-bl-none bg-gray-800 text-gray-200')}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-3 border-t border-white/10 pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Wrench className="h-3 w-3" />
                        <span>Tool Used: {renderToolCall(msg.toolCalls[0])}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-2 text-right text-xs text-gray-400">{formatTime(msg.timestamp)}</div>
                </div>
                {msg.role === 'user' && <User className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-600 p-1 text-white" />}
              </motion.div>
            ))}
            {chatState.streamingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-2 justify-start"
              >
                <Bot className="h-6 w-6 flex-shrink-0 rounded-full bg-indigo-600 p-1 text-white" />
                <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-gray-800 px-4 py-3 text-gray-200">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{chatState.streamingMessage}<span className="animate-pulse">▍</span></p>
                </div>
              </motion.div>
            )}
            {(isLoading || chatState.isProcessing) && !chatState.streamingMessage && (
              <div className="flex items-end gap-2 justify-start">
                <Bot className="h-6 w-6 flex-shrink-0 rounded-full bg-indigo-600 p-1 text-white" />
                <div className="rounded-2xl rounded-bl-none bg-gray-800 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 delay-0"></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 delay-150"></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 delay-300"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 border-t border-white/10 p-4">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-center text-xs text-yellow-200 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>AI features require API keys. This demo uses mock data.</span>
          </div>
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for analysis, e.g., 'Analyze EUR/USD'"
              className="w-full resize-none rounded-lg border-white/20 bg-gray-800 pr-20 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
              rows={1}
              disabled={isLoading || chatState.isProcessing}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-600"
              disabled={!input.trim() || isLoading || chatState.isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}