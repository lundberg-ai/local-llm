"use client";

import type { ChatSession } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, MessageSquareText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatListProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  disabled?: boolean;
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  disabled,
}: ChatListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <Button
          onClick={onCreateChat}
          variant="outline"
          className="w-full justify-start gap-2 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:ring-sidebar-ring"
          disabled={disabled}
        >
          <MessageSquarePlus className="h-4 w-4 text-accent" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-grow p-2">
        {chats.length === 0 && (
          <p className="text-sm text-sidebar-foreground/70 text-center py-4">
            No chats yet.
          </p>
        )}
        <ul className="space-y-1">
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat.id)}
                disabled={disabled}
                className={cn(
                  "w-full flex items-center justify-between text-left p-2 rounded-md text-sm truncate",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring",
                  activeChatId === chat.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquareText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat.title || "New Chat"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-50 hover:opacity-100 hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  disabled={disabled}
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
