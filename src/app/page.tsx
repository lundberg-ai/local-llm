"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import type { ChatSession, Message, LLMModel } from "@/types";
import { AVAILABLE_MODELS } from "@/config/models";
import { ChatList } from "@/components/ChatList";
import { ChatWindow } from "@/components/ChatWindow";
import { LLMSelector } from "@/components/LLMSelector";
import AipifyLogo from "@/components/icons/AipifyLogo";
import { generateConversationTitle as generateTitleFlow } from "@/ai/flows/generate-conversation-title";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft, Settings2 } from "lucide-react";

export default function AipifyLocalPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [models] = useState<LLMModel[]>(AVAILABLE_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    AVAILABLE_MODELS[0]?.id
  );
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const { toast } = useToast();

  // Load chats from local storage on mount
  useEffect(() => {
    const storedChats = localStorage.getItem("aipify-local-chats");
    if (storedChats) {
      try {
        const parsedChats: ChatSession[] = JSON.parse(storedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChats(parsedChats);
        if (parsedChats.length > 0 && !activeChatId) {
          setActiveChatId(parsedChats[0].id);
        }
      } catch (error) {
        console.error("Failed to parse chats from local storage:", error);
        localStorage.removeItem("aipify-local-chats"); // Clear corrupted data
      }
    }
  }, []);

  // Save chats to local storage whenever they change
  useEffect(() => {
    if (chats.length > 0 || localStorage.getItem("aipify-local-chats")) { // Avoid saving empty initial state if nothing was loaded
      localStorage.setItem("aipify-local-chats", JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat", // Placeholder, will be generated
      messages: [],
      createdAt: new Date(),
      modelId: selectedModelId,
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatId(newChat.id);
  }, [selectedModelId]);

  // Create initial chat if none exist
  useEffect(() => {
    if (chats.length === 0 && !localStorage.getItem("aipify-local-chats")) { // only if truly empty start
      createNewChat();
    }
  }, [chats.length, createNewChat]);


  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(chats.length > 1 ? chats.find(c => c.id !== chatId)?.id || null : null);
      if (chats.length <= 1) createNewChat(); // if last chat is deleted, create a new one
    }
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    // Optionally update current active chat's model
    if (activeChatId) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId ? { ...chat, modelId } : chat
        )
      );
    }
  };

  const generateTitle = async (chatId: string, conversationHistory: string) => {
    if (isGeneratingTitle) return;
    setIsGeneratingTitle(true);
    try {
      const result = await generateTitleFlow({ conversationHistory });
      if (result.title) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === chatId ? { ...chat, title: result.title } : chat
          )
        );
      }
    } catch (error) {
      console.error("Title generation error:", error);
      toast({
        title: "Title Generation Failed",
        description: "Could not generate a title for the chat.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleSendMessage = async (chatId: string, content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );
    setIsLoadingResponse(true);

    // Simulate API call and AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `As ${models.find(m => m.id === selectedModelId)?.name || 'the Local LLM'}, I received: "${content}". This is a mock response.`,
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages, assistantMessage];
          // Check for title generation
          if (updatedMessages.length === 2 && chat.title === "New Chat") { // 1 user, 1 assistant
            const history = updatedMessages
              .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
              .join("\n");
            generateTitle(chatId, history);
          }
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      })
    );
    setIsLoadingResponse(false);
  };

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" side="left" className="border-r-sidebar-border">        <SidebarHeader className="h-16 flex items-center p-4 border-b border-sidebar-border min-h-[64px] max-h-[64px]">
        <div className="flex items-center gap-2">
          <AipifyLogo className="text-accent h-8 w-8" />
          <h1 className="font-headline text-2xl font-semibold text-sidebar-foreground">
            Aipify Local
          </h1>
        </div>
      </SidebarHeader>
        <LLMSelector
          models={models}
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          disabled={isLoadingResponse || isGeneratingTitle}
        />
        <SidebarContent>
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onCreateChat={createNewChat}
            onDeleteChat={handleDeleteChat}
            disabled={isLoadingResponse || isGeneratingTitle}
          />        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border h-[74px] min-h-[74px] max-h-[74px] flex items-center">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20">
            <Settings2 className="h-4 w-4 text-accent" />
            Settings
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex h-16 items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10 md:justify-end min-h-[64px] max-h-[64px] header-64">
          <SidebarTrigger className="md:hidden">
            <PanelLeft />
          </SidebarTrigger>
          <h2 className="text-lg font-semibold truncate md:hidden font-headline">
            {activeChat?.title || "Chat"}
          </h2>
          {/* Placeholder for potential top-right actions in header */}
          <div className="md:hidden w-8"></div> {/* Spacer for mobile title centering */}
        </div>
        <ChatWindow
          chatSession={activeChat}
          onSendMessage={handleSendMessage}
          isLoadingResponse={isLoadingResponse}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
