import OpenAIClient from '$lib/server/OpenAIClient';

export const actions = {
    getCompletion: async ({ request }) => {
        const client = new OpenAIClient();
        const data = await request.formData();
        const message = data.get('message')?.toString();
        if (!message) return;
        return await client.createCompletion(message);
    }
};
