import OpenAIClient from '$lib/server/OpenAIClient';
import type { ChatCompletionRequestMessage } from 'openai';

export const actions = {
    getCompletion: async ({ request }) => {
        const data = await request.formData();
        const userMessage = data.get('message');
        const serializedHistory = data.get('chatHistory');
        if (!userMessage || !serializedHistory) return;
        const history = JSON.parse(serializedHistory.toString()) as ChatCompletionRequestMessage[];

        // Call the createCompletion function with the chat history
        const client = new OpenAIClient();
        const responseMessage = await client.createCompletion(history);

        return responseMessage;
    }
};
