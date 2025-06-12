"use client";

import type { LLMModel } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BrainCircuit } from "lucide-react";

interface LLMSelectorProps {
  models: LLMModel[];
  selectedModelId: string | undefined;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

export function LLMSelector({
  models,
  selectedModelId,
  onSelectModel,
  disabled,
}: LLMSelectorProps) {
  return (
    <div className="p-2 space-y-2 border-b border-sidebar-border">
      <Label htmlFor="llm-select" className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
        <BrainCircuit className="h-4 w-4 text-accent" />
        LLM Model
      </Label>
      <Select
        value={selectedModelId}
        onValueChange={onSelectModel}
        disabled={disabled}
      >
        <SelectTrigger id="llm-select" className="w-full h-9 bg-sidebar-background hover:bg-sidebar-accent/10 focus:ring-sidebar-ring">
          <SelectValue placeholder="Select LLM" />
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
