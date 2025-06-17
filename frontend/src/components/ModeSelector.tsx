"use client";

import { MODES, type Mode } from "@/config/models";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wifi, WifiOff } from "lucide-react";

interface ModeSelectorProps {
	mode: Mode;
	onModeChange: (mode: Mode) => void;
	disabled?: boolean;
}

export function ModeSelector({ mode, onModeChange, disabled }: ModeSelectorProps) {
	const isOnline = mode === MODES.ONLINE;

	return (
		<div className="p-2 space-y-2 border-b border-sidebar-border">
			<Label htmlFor="mode-switch" className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70">
				{isOnline ? (
					<Wifi className="h-4 w-4 text-green-500" />
				) : (
					<WifiOff className="h-4 w-4 text-orange-500" />
				)}
				{isOnline ? 'Online Mode' : 'Offline Mode'}
			</Label>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<span className="text-xs text-sidebar-foreground/60">
						{isOnline ? 'Gemini API' : 'Local LLM'}
					</span>
					<Switch
						id="mode-switch"
						checked={isOnline}
						onCheckedChange={(checked) =>
							onModeChange(checked ? MODES.ONLINE : MODES.OFFLINE)
						}
						disabled={disabled}
					/>
				</div>
			</div>
			{!isOnline && (
				<p className="text-xs text-sidebar-foreground/50">
					Requires local backend server
				</p>
			)}
			{isOnline && (
				<p className="text-xs text-sidebar-foreground/50">
					Requires API key
				</p>
			)}
		</div>
	);
}
