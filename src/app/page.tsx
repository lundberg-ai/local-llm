
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import type { ChatSession, Message, LLMModel } from "@/types";
import { LOCAL_MODELS, GEMINI_MODELS } from "@/config/models";
import { ChatList } from "@/components/ChatList";
import { ChatWindow } from "@/components/ChatWindow";
import { LLMSelector } from "@/components/LLMSelector";
import AipifyLogo from "@/components/icons/AipifyLogo";
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
// Switch component is no longer needed for mode toggle
// import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PanelLeft, Settings2, Sun, Moon, Wifi, WifiOff, KeyRound } from "lucide-react";
import { getApiKey, hasApiKey, getApiKeySource } from '@/lib/api-key';

export default function AipifyLocalPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [models, setModels] = useState<LLMModel[]>(LOCAL_MODELS);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
    LOCAL_MODELS[0]?.id // Default to first local model
  );
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [tempApiKeyInput, setTempApiKeyInput] = useState('');

  const { toast } = useToast();

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
    } catch {
      console.warn("Could not access localStorage for theme preference.");
    }
    setTheme(initialUserTheme);
    if (initialUserTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        try {
          localStorage.setItem('aipify-local-theme', 'dark');
        } catch {
          console.warn("Could not save theme preference to localStorage.");
        }
      } else {
        document.documentElement.classList.remove('dark');
        try {
          localStorage.setItem('aipify-local-theme', 'light');
        } catch {
          console.warn("Could not save theme preference to localStorage.");
        }
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem('aipify-local-mode') as 'offline' | 'online' | null;
      const availableApiKey = getApiKey();

      if (storedMode === 'online' && availableApiKey) {
        setApiKey(availableApiKey);
        setMode('online');
      } else {
        setMode('offline');
        if (availableApiKey) {
          setApiKey(availableApiKey); // Keep available API key even if starting offline
        }
      }
    } catch {
      console.warn("Could not access localStorage for mode/API key.");
      setMode('offline');
      // Still try to get API key from environment
      const envApiKey = getApiKey();
      if (envApiKey) {
        setApiKey(envApiKey);
      }
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('aipify-local-mode', mode);

      // Only manage localStorage if the API key is from localStorage (not environment)
      const apiKeySource = getApiKeySource();
      if (apiKeySource === 'localStorage' && apiKey) {
        localStorage.setItem('aipify-local-api-key', apiKey);
      } else if (apiKeySource === 'none') {
        localStorage.removeItem('aipify-local-api-key');
        if (mode === 'online') {
          setMode('offline'); // Revert to offline if API key is removed while online
          toast({
            title: "Switched to Offline Mode",
            description: "API key was removed. Online mode requires an API key.",
            variant: "default",
          });
        }
      }
      // If apiKeySource is 'environment', we don't modify localStorage
    } catch {
      console.warn("Could not save mode/API key to localStorage.");
    }
  }, [mode, apiKey, toast]);


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
      } catch {
        console.warn("Could not remove corrupted chats from localStorage.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (chats.length > 0 || localStorage.getItem("aipify-local-chats")) {
        localStorage.setItem("aipify-local-chats", JSON.stringify(chats));
      }
    } catch {
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
    let hasStoredChats = false;
    try {
      hasStoredChats = !!localStorage.getItem("aipify-local-chats");
    } catch {
      // localStorage not available
    }
    if (chats.length === 0 && !hasStoredChats) {
      createNewChat();
    }
  }, [chats.length, createNewChat]);


  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    const selectedChat = chats.find(c => c.id === chatId);
    if (selectedChat && selectedChat.modelId) {
      setSelectedModelId(selectedChat.modelId);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prevChats) => {
      const updatedChats = prevChats.filter((chat) => chat.id !== chatId);
      if (activeChatId === chatId) {
        if (updatedChats.length > 0) {
          setActiveChatId(updatedChats[0].id);
          if (updatedChats[0].modelId) {
            setSelectedModelId(updatedChats[0].modelId);
          }
        } else {
          setActiveChatId(null);
        }
      }
      return updatedChats;
    });
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
    const currentApiKey = getApiKey();

    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationHistory,
          apiKey: mode === 'online' ? currentApiKey : undefined,
          modelId: mode === 'online' ? selectedModelId : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate title');
      }

      const result = await response.json();
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

    let updatedMessagesWithUser = chats;
    setChats((prevChats) => {
      updatedMessagesWithUser = prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      );
      return updatedMessagesWithUser;
    }); setIsLoadingResponse(true);
    let assistantContent: string;
    const llmName = models.find(m => m.id === selectedModelId)?.name || (mode === 'online' ? 'Gemini' : 'Local LLM');
    const currentApiKey = getApiKey();

    try {
      if (mode === 'online' && currentApiKey) {
        // Get conversation history for context
        const currentChat = chats.find(chat => chat.id === chatId);
        const conversationHistory = currentChat?.messages || [];

        // Make API call to our chat endpoint
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, body: JSON.stringify({
            message: content,
            conversationHistory: conversationHistory,
            apiKey: currentApiKey,
            modelId: selectedModelId,
            modelName: llmName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get response from API');
        }

        const data = await response.json();
        assistantContent = data.response;
      } else if (mode === 'online' && !currentApiKey) {
        // Online mode selected but no API key available
        assistantContent = `Online mode is enabled but no API key is available. Please set your Gemini API key in the settings to use online features.`;
        toast({
          title: "API Key Required",
          description: "Please set your Gemini API key in settings to use online mode.",
          variant: "destructive",
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        assistantContent = `As ${llmName}, I received: "${content}". This is a mock response for offline mode.`;
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      assistantContent = `Sorry, I encountered an error: ${errorMessage}. Please try again.`;
      toast({
        title: "Error Generating Response",
        description: errorMessage,
        variant: "destructive",
      });
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: assistantContent,
      timestamp: new Date(),
    };

    let needsTitleGeneration = false;
    let conversationHistoryForTitle = "";

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const finalMessages = [...chat.messages, assistantMessage];
          if (finalMessages.length === 2 && chat.title === "New Chat") {
            needsTitleGeneration = true;
            conversationHistoryForTitle = finalMessages
              .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
              .join("\n");
          }
          return { ...chat, messages: finalMessages };
        }
        return chat;
      })
    );

    setIsLoadingResponse(false);

    if (needsTitleGeneration && chatId) {
      await generateTitle(chatId, conversationHistoryForTitle);
    }
  };
  const handleModeSwitchChange = (isAttemptingOnline: boolean) => {
    if (isAttemptingOnline) {
      if (hasApiKey()) {
        setMode('online');
        // Update the local apiKey state with the current available key
        const currentApiKey = getApiKey();
        if (currentApiKey) {
          setApiKey(currentApiKey);
        }
      } else {
        // No API key available, switch to online anyway but user can manually set key later
        setMode('online');
        toast({
          title: "No API Key Found",
          description: "Online mode is enabled, but no API key is available. Set one in settings to use online features.",
          variant: "default",
        });
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
      setTempApiKeyInput('');
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
  const handleOpenSettingsDialog = () => {
    // Show the localStorage key, not the effective key (which might be from environment)
    try {
      const localStorageKey = localStorage.getItem('aipify-local-api-key');
      setTempApiKeyInput(localStorageKey || '');
    } catch {
      setTempApiKeyInput('');
    }
    setShowSettingsDialog(true);
  };
  const handleSettingsDialogSubmit = () => {
    const newApiKey = tempApiKeyInput.trim();
    if (newApiKey) {
      setApiKey(newApiKey);
      try {
        localStorage.setItem('aipify-local-api-key', newApiKey);
      } catch {
        console.warn("Could not save API key to localStorage.");
      }
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been updated and will take priority over environment variables.",
      });
    } else {
      setApiKey(null);
      try {
        localStorage.removeItem('aipify-local-api-key');
      } catch {
        console.warn("Could not remove API key from localStorage.");
      }

      // Check if there's still an API key available from environment
      const envApiKey = getApiKey();
      if (envApiKey) {
        setApiKey(envApiKey);
        toast({
          title: "Local API Key Cleared",
          description: "Your saved API key has been removed. Using API key from environment variables.",
        });
      } else {
        toast({
          title: "API Key Cleared",
          description: "Your Gemini API key has been removed.",
        });
        if (mode === 'online') {
          setMode('offline');
          toast({
            title: "Switched to Offline Mode",
            description: "API key was removed. Online mode requires an API key.",
            variant: "default",
            className: "mt-2",
          });
        }
      }
    }
    setShowSettingsDialog(false);
    setTempApiKeyInput('');
  };

  const handleSettingsDialogClose = () => {
    setShowSettingsDialog(false);
    setTempApiKeyInput('');
  };


  useEffect(() => {
    if (mode === 'online') {
      setModels(GEMINI_MODELS);
      if (!GEMINI_MODELS.find(m => m.id === selectedModelId) || !selectedModelId) {
        setSelectedModelId(GEMINI_MODELS[0]?.id);
      }
    } else {
      setModels(LOCAL_MODELS);
      if (!LOCAL_MODELS.find(m => m.id === selectedModelId) || !selectedModelId) {
        setSelectedModelId(LOCAL_MODELS[0]?.id);
      }
    }
  }, [mode, selectedModelId]);

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
        <SidebarFooter className="p-2 border-t border-sidebar-border h-[74px] min-h-[74px] max-h-[74px] flex items-center">          <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-accent"
          onClick={handleOpenSettingsDialog}
        >            <Settings2 className="h-4 w-4 text-accent" />
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
          <div className="flex items-center space-x-2"> {/* Reduced space-x-4 to space-x-2 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleModeSwitchChange(mode === 'offline')}
              disabled={isLoadingResponse || isGeneratingTitle}
              aria-label={`Switch to ${mode === 'offline' ? 'Online' : 'Offline'} mode`}
            >
              {mode === 'online' ? <Wifi className="h-5 w-5 text-primary" /> : <WifiOff className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>        <ChatWindow
          chatSession={activeChat || null}
          onSendMessage={handleSendMessage}
          isLoadingResponse={isLoadingResponse}
          mode={mode}
          selectedModelId={selectedModelId}
        />
      </SidebarInset>

      {/* API Key Dialog for initial online switch */}
      <Dialog open={showApiKeyDialog} onOpenChange={(openState) => {
        if (!openState) handleApiKeyDialogClose();
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
              <Label htmlFor="apiKeyInputInitial" className="text-right">
                API Key
              </Label>
              <Input
                id="apiKeyInputInitial"
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

      {/* Settings Dialog to change/clear API Key */}
      <Dialog open={showSettingsDialog} onOpenChange={(openState) => {
        if (!openState) handleSettingsDialogClose();
      }}>        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-accent" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Manage your Gemini AI API key for enhanced online chat features.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Current Status */}            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Status</h4>
              {(() => {
                const source = getApiKeySource();

                if (source === 'localStorage') {
                  return (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Using your personal API key
                      </span>
                    </div>
                  );
                } else if (source === 'environment') {
                  return (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        Using shared API key (limited capacity)
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                        No API key available
                      </span>
                    </div>
                  );
                }
              })()}
            </div>

            {/* API Key Input */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="apiKeyInputSettings" className="text-sm font-medium">
                  Google Gemini API Key
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Get your free API key from Google AI Studio:
                </p>
              </div>              {/* Instructions */}
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
                <p>1. Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">Google AI Studio</a></p>
                <p>2. Sign in with your Google account</p>
                <p>3. Click &ldquo;Create API Key&rdquo;</p>
                <p>4. Copy the key and paste it below</p>
              </div>

              <div className="flex gap-2">                <Input
                id="apiKeyInputSettings"
                value={tempApiKeyInput}
                onChange={(e) => setTempApiKeyInput(e.target.value)}
                className="flex-1"
                placeholder={getApiKeySource() === 'localStorage' ? 'Your current API key' : 'AIzaSy... (your API key)'}
                type="password"
              />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                  className="shrink-0"
                >
                  Open Studio
                </Button>
              </div>
            </div>

            {/* Security & Usage Info */}
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <span className="text-green-600">•</span>
                  Your API key is stored only locally in your browser
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600">•</span>
                  The key is never shared with servers or other users
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600">•</span>
                  Gemini 1.5 Flash is free up to 15 requests per minute
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleSettingsDialogClose}>Cancel</Button>
            <Button onClick={handleSettingsDialogSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

