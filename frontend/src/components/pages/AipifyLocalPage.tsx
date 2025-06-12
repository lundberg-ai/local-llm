import React, { useState, useEffect, useCallback } from "react";
import { ChatList } from "../ChatList";
import { ChatWindow } from "../ChatWindow";
import { LLMSelector } from "../LLMSelector";
import { AVAILABLE_MODELS } from "../../config/models";
import type { ChatSession, Message, LLMModel } from "../../types";
import { useToast } from "../../hooks/use-toast";

export default function AipifyLocalPage() {
	const [chats, setChats] = useState<ChatSession[]>([]);
	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [models] = useState<LLMModel[]>(AVAILABLE_MODELS);
	const [selectedModelId, setSelectedModelId] = useState<string | undefined>(AVAILABLE_MODELS[0]?.id);
	const [isLoadingResponse, setIsLoadingResponse] = useState(false);
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

	const toggleTheme = () => {
		setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
	};

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

	return (
		<div>
			<button onClick={toggleTheme}>Toggle Theme</button>
			<ChatList
				chats={chats}
				activeChatId={activeChatId}
				onSelectChat={handleSelectChat}
				onCreateChat={createNewChat}
				onDeleteChat={handleDeleteChat}
			/>
			<ChatWindow
				chatSession={chats.find((chat) => chat.id === activeChatId) || null}
				onSendMessage={async (chatId, content) => {
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
				}}
				isLoadingResponse={isLoadingResponse}
			/>
			<LLMSelector
				models={models}
				selectedModelId={selectedModelId}
				onSelectModel={handleSelectModel}
			/>
		</div>
	);
}
