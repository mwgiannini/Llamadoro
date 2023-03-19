import { writable } from 'svelte/store';
import type { ChatCompletionRequestMessage } from 'openai';

export const chatHistory = writable<ChatCompletionRequestMessage[]>([]);
