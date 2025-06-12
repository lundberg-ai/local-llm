
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
import { PanelLeft, Settings2, Sun, Moon } from "lucide-react";

export default function AipifyLocalPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [models] = useState<LLMModel[]>(AVAILABLE_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    AVAILABLE_MODELS[0]?.id
  );
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { toast } = useToast();

  useEffect(() => {
    // Determine initial theme (localStorage > system preference > default 'light')
    let initialUserTheme: 'light' | 'dark' = 'light';
    try {
      const storedTheme = localStorage.getItem('aipify-local-theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        initialUserTheme = storedTheme;
      } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          initialUserTheme = 'dark';
        }
      }
    } catch (e) {
      console.warn("Could not access localStorage for theme preference.");
      // Fallback to system preference if localStorage fails
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        initialUserTheme = 'dark';
      }
    }
    
    setTheme(initialUserTheme); // Set state

    // Apply class to HTML element based on resolved initial theme
    // This is done here initially and also in the second useEffect on theme change
    if (initialUserTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []); // Empty dependency array: run once on mount

  useEffect(() => {
    // This effect runs when `theme` state changes (e.g., from the toggle button)
    // or on initial load after the first effect sets the theme.
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('aipify-local-theme', 'dark');
      } catch (e) {
        console.warn("Could not save theme preference to localStorage.");
      }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('aipify-local-theme', 'light');
      } catch (e) {
        console.warn("Could not save theme preference to localStorage.");
      }
    }
  }, [theme]); // Dependency: run when `theme` changes

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Load chats from local storage on mount
  useEffect(() => {
    const storedChats = localStorage.getItem("aipify-local-chats");
    if (storedChats) {
      try {
        const parsedChats: ChatSession[] = JSON.parse(storedChats).map((chat: ChatSession & { createdAt: string; messages: Array<Message & { timestamp: string }> }) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: Message & { timestamp: string }) => ({
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
  }, []); // Empty dependency array - only run on mount

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

  useEffect(() => {
    if (chats.length === 0 && !localStorage.getItem("aipify-local-chats")) {
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
      if (chats.length <= 1) createNewChat(); 
    }
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
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
          if (updatedMessages.length === 2 && chat.title === "New Chat") {
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
      <Sidebar collapsible="icon" side="left" className="border-r-sidebar-border">
        <SidebarHeader className="h-16 flex items-center p-4 border-b border-sidebar-border min-h-[64px] max-h-[64px]">
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
          />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border h-[74px] min-h-[74px] max-h-[74px] flex items-center">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20">
            <Settings2 className="h-4 w-4 text-accent" />
            Settings
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex h-16 items-center p-4 border-b border-border sticky top-0 bg-background z-10 min-h-[64px] max-h-[64px] header-64">
          <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
            <h2 className="text-lg font-semibold truncate font-headline">
              {activeChat?.title || "Chat"}
            </h2>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        <ChatWindow
          chatSession={activeChat || null}
          onSendMessage={handleSendMessage}
          isLoadingResponse={isLoadingResponse}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

    