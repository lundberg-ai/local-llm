
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PanelLeft, Settings2, Sun, Moon, Wifi, WifiOff, KeyRound } from "lucide-react";

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

  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [tempApiKeyInput, setTempApiKeyInput] = useState('');

  const { toast } = useToast();

  // Theme initialization
  useEffect(() => {
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
      // Fallback for environments where localStorage is not available or matchMedia fails
      // Consider a default or let CSS handle it if JS fails entirely
    }
    setTheme(initialUserTheme);
    if (initialUserTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Theme persistence
  useEffect(() => {
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
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Mode and API Key initialization from localStorage
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem('aipify-local-mode') as 'offline' | 'online' | null;
      const storedApiKey = localStorage.getItem('aipify-local-api-key');

      if (storedMode === 'online' && storedApiKey) {
        setApiKey(storedApiKey);
        setMode('online');
      } else {
        setMode('offline'); 
        if (storedApiKey) { 
          setApiKey(storedApiKey);
        }
      }
    } catch (e) {
      console.warn("Could not access localStorage for mode/API key.");
      setMode('offline'); // Default to offline if localStorage fails
    }
  }, []);

  // Mode and API Key persistence to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aipify-local-mode', mode);
      if (apiKey) {
        localStorage.setItem('aipify-local-api-key', apiKey);
      } else {
        if (mode === 'online') {
          setMode('offline'); // Switch to offline if API key becomes null while in online mode
        }
        localStorage.removeItem('aipify-local-api-key');
      }
    } catch (e) {
      console.warn("Could not save mode/API key to localStorage.");
    }
  }, [mode, apiKey]);


  // Load chats from local storage on mount
  useEffect(() => {
    try {
      const storedChats = localStorage.getItem("aipify-local-chats");
      if (storedChats) {
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
      }
    } catch (error) {
      console.error("Failed to parse chats from local storage:", error);
      try {
        localStorage.removeItem("aipify-local-chats");
      } catch (e) {
        console.warn("Could not remove corrupted chats from localStorage.");
      }
    }
  }, [activeChatId]); // Added activeChatId dependency to ensure it is set if chats load

  // Save chats to local storage whenever they change
  useEffect(() => {
    try {
      if (chats.length > 0 || localStorage.getItem("aipify-local-chats")) {
        localStorage.setItem("aipify-local-chats", JSON.stringify(chats));
      }
    } catch (e) {
      console.warn("Could not save chats to localStorage.");
    }
  }, [chats]);

  const createNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      modelId: selectedModelId,
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatId(newChat.id);
  }, [selectedModelId]);

  useEffect(() => {
    // Check if localStorage is available before trying to use it
    let hasStoredChats = false;
    try {
      hasStoredChats = !!localStorage.getItem("aipify-local-chats");
    } catch (e) {
      // localStorage not available or accessible
    }

    if (chats.length === 0 && !hasStoredChats) {
      createNewChat();
    }
  }, [chats.length, createNewChat]);


  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      const remainingChats = chats.filter(c => c.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0].id);
      } else {
        setActiveChatId(null); // No chats left
        createNewChat(); // Create a new one if all are deleted
      }
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

    const llmName = mode === 'online' ? "Gemini (Online)" : (models.find(m => m.id === selectedModelId)?.name || 'Local LLM');
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `As ${llmName}, I received: "${content}". This is a mock response.`,
      timestamp: new Date(),
    };

    let needsTitleGeneration = false;
    let conversationHistoryForTitle = "";

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages, assistantMessage];
          if (updatedMessages.length === 2 && chat.title === "New Chat") {
            needsTitleGeneration = true;
            conversationHistoryForTitle = updatedMessages
              .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
              .join("\n");
          }
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      })
    );
    
    setIsLoadingResponse(false);

    if (needsTitleGeneration) {
      await generateTitle(chatId, conversationHistoryForTitle);
    }
  };

  const handleModeSwitchChange = (isOnlineChecked: boolean) => {
    if (isOnlineChecked) { 
      if (apiKey) {
        setMode('online');
      } else {
        setTempApiKeyInput(''); 
        setShowApiKeyDialog(true);
      }
    } else { 
      setMode('offline');
    }
  };

  const handleApiKeyDialogSubmit = () => {
    if (tempApiKeyInput.trim()) {
      setApiKey(tempApiKeyInput.trim());
      setMode('online');
      setShowApiKeyDialog(false);
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key.",
        variant: "destructive",
      });
    }
  };

  const handleApiKeyDialogClose = () => {
    setShowApiKeyDialog(false);
    setTempApiKeyInput(''); 
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
          disabled={isLoadingResponse || isGeneratingTitle || mode === 'online'} 
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="mode-switch" className="text-sm flex items-center gap-1 cursor-pointer select-none" onClick={() => handleModeSwitchChange(mode === 'offline')}>
                {mode === 'offline' ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4 text-primary" />}
                <span>{mode === 'offline' ? 'Offline' : 'Online'}</span>
              </Label>
              <Switch
                id="mode-switch"
                checked={mode === 'online'}
                onCheckedChange={handleModeSwitchChange}
                disabled={isLoadingResponse || isGeneratingTitle}
                aria-label={`Switch to ${mode === 'offline' ? 'Online' : 'Offline'} mode`}
              />
            </div>
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

      <Dialog open={showApiKeyDialog} onOpenChange={(openState) => {
          if (!openState) {
            handleApiKeyDialogClose();
          }
        }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-accent" />
              Enter Gemini API Key
            </DialogTitle>
            <DialogDescription>
              To use Online Mode with Gemini, please enter your API key. You can get one from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:text-primary/80"
              >
                Google AI Studio
              </a>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKeyInput" className="text-right">
                API Key
              </Label>
              <Input
                id="apiKeyInput"
                value={tempApiKeyInput}
                onChange={(e) => setTempApiKeyInput(e.target.value)}
                className="col-span-3"
                placeholder="Enter your API key"
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleApiKeyDialogClose}>Cancel</Button>
            <Button onClick={handleApiKeyDialogSubmit}>Save & Use Online</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
