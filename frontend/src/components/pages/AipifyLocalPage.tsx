import React, { useState } from "react";
import { ChatList } from "../ChatList";
import { ChatWindow } from "../ChatWindow";
import { LLMSelector } from "../LLMSelector";
import { AVAILABLE_MODELS } from "../../config/models";
import type { ChatSession, Message } from "../../types";

export default function AipifyLocalPage() {
	const [chats, setChats] = useState<ChatSession[]>([]);
	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [models] = useState(AVAILABLE_MODELS);
	const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined);

	const handleSelectChat = (chatId: string) => setActiveChatId(chatId);
	const handleCreateChat = () =>
		setChats([
			...chats,
			{
				id: Date.now().toString(),
				title: "New Chat",
				createdAt: new Date(),
				messages: [],
				modelId: undefined,
			},
		]);
	const handleDeleteChat = (chatId: string) => setChats(chats.filter((chat) => chat.id !== chatId));
	const handleSelectModel = (modelId: string) => setSelectedModelId(modelId);

	return (
		<div>
			<ChatList
				chats={chats}
				activeChatId={activeChatId}
				onSelectChat={handleSelectChat}
				onCreateChat={handleCreateChat}
				onDeleteChat={handleDeleteChat}
			/>
			<ChatWindow
				chatSession={chats.find((chat) => chat.id === activeChatId) || null}
				onSendMessage={async (chatId, content) => {
					setChats(
						chats.map((chat) =>
							chat.id === chatId
								? {
									...chat,
									messages: [
										...chat.messages,
										{
											id: Date.now().toString(),
											role: "user",
											content,
											timestamp: new Date(),
										},
									],
								}
								: chat
						)
					);
				}}
				isLoadingResponse={false}
			/>
			<LLMSelector
				models={models}
				selectedModelId={selectedModelId}
				onSelectModel={handleSelectModel}
			/>
		</div>
	);
}
