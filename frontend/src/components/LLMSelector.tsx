"use client";

import type { LLMModel } from "@/types";
import type { Mode } from "@/config/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Cpu, Globe } from "lucide-react";
import { MODES } from "@/config/models";

interface LLMSelectorProps {
  models: LLMModel[];
  selectedModelId: string | undefined;
  onSelectModel: (modelId: string) => void;
  mode: Mode;
  disabled?: boolean;
}

export function LLMSelector({
  models,
  selectedModelId,
  onSelectModel,
  mode,
  disabled,
}: LLMSelectorProps) {
  const isOnline = mode === MODES.ONLINE;

  return (
    <div className="p-2 space-y-2 border-b border-sidebar-border h-20 min-h-[80px] max-h-[80px]">
      <Label htmlFor="llm-select" className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
        {isOnline ? (
          <>
            <Globe className="h-4 w-4 text-accent" />
            Online Model
          </>
        ) : (
          <>
            <Cpu className="h-4 w-4 text-accent" />
            Local Model
          </>
        )}
      </Label>
      <Select
        value={selectedModelId}
        onValueChange={onSelectModel}
        disabled={disabled}
      >        <SelectTrigger id="llm-select" className="w-full h-9 bg-sidebar-background hover:bg-sidebar-accent/10 focus:ring-sidebar-ring text-left">
          <SelectValue placeholder={`Select ${isOnline ? 'online' : 'local'} model`} className="truncate" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
