"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { ChatSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageDisplay } from "./ChatMessageDisplay";
import { Loader2, Send, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { summarizeConversation as summarizeConversationFlow } from "@/ai/flows/summarize-conversation";

interface ChatWindowProps {
  chatSession: ChatSession | null;
  onSendMessage: (chatId: string, content: string) => Promise<void>;
  isLoadingResponse: boolean;
}

export function ChatWindow({
  chatSession,
  onSendMessage,
  isLoadingResponse,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatSession?.messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSession) return;
    await onSendMessage(chatSession.id, inputValue.trim());
    setInputValue("");
  };

  const handleSummarize = async () => {
    if (!chatSession || chatSession.messages.length === 0) {
      toast({
        title: "Cannot Summarize",
        description: "There are no messages in this chat to summarize.",
        variant: "destructive",
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const conversationText = chatSession.messages
        .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
        .join("\n");

      const result = await summarizeConversationFlow({ conversationText });

      if (result.summary && chatSession) {
        await onSendMessage(chatSession.id, `Summary of the conversation:\n${result.summary}`);
        toast({
          title: "Conversation Summarized",
          description: "The summary has been added to the chat.",
        });
      } else {
        throw new Error("Failed to generate summary or summary was empty.");
      }
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Summarization Failed",
        description: "Could not summarize the conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!chatSession) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 text-center">
        <Zap className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-muted-foreground">Select a chat or start a new one</h2>
        <p className="text-muted-foreground">Your Aipify Local LLM companion is ready.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center h-20 min-h-[80px] max-h-[80px]">
        <h2 className="text-xl font-semibold truncate font-headline">
          {chatSession.title || "New Chat"}
        </h2>
        <Button
          onClick={handleSummarize}
          disabled={isSummarizing || isLoadingResponse || chatSession.messages.length === 0}
          size="sm"
          variant="outline"
          className="hover:bg-accent hover:text-accent-foreground"
        >
          {isSummarizing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Summarize
        </Button>
      </div>

      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {chatSession.messages.map((msg) => (
          <ChatMessageDisplay key={msg.id} message={msg} />
        ))}
        {isLoadingResponse && (
          <div className="flex items-start gap-3 my-4 justify-start">
            <Loader2 className="h-5 w-5 text-accent animate-spin" />
            <span className="text-sm text-muted-foreground">Assistant is typing...</span>
          </div>
        )}      </ScrollArea>

      <div className="p-4 border-t h-[74px] min-h-[74px] max-h-[74px] flex items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 w-full"
        >
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoadingResponse || isSummarizing}
            className="flex-grow focus:ring-accent focus:border-accent"
          />
          <Button type="submit" disabled={!inputValue.trim() || isLoadingResponse || isSummarizing} className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
