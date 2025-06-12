"use client";

import type { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatMessageDisplayProps {
  message: Message;
}

export function ChatMessageDisplay({ message }: ChatMessageDisplayProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 my-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-accent" />
          </AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          "max-w-[75%] whitespace-pre-wrap rounded-xl",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        <CardContent className="p-3 text-sm">
          <p>{message.content}</p>
        </CardContent>
      </Card>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-5 w-5 text-accent" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
