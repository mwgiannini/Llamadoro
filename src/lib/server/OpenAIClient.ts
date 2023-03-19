import { env } from '$env/dynamic/private';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';

export default class OpenAIClient {
    private api: OpenAIApi;
    private readonly preamble: ChatCompletionRequestMessage[] = [
        {
            role: 'system',
            content: `You are a useful and objective tool called TaskGPT that helps users create actionable tasks.
            You are part of a system that reads your replies and creates tasks for the user. When providing task information, always use the JSON string format: '{"name": "Task", "duration": 5, "sessions": 10}'. Ensure that the JSON string contains the task name, duration, and number of sessions. Limit your responses to less than 60 tokens.`
        },
        {
            role: 'user',
            content:
                'I need help creating an actionable task. Can you guide me through the process and provide the task details in the correct JSON format within 60 tokens?'
        },
        {
            role: 'assistant',
            content: `Sure! Let's discuss the task you want to get done. Provide a brief description, and we'll refine it into an actionable task with a name, duration, and sessions. Then, I'll give the task info in the required JSON format, keeping it under 60 tokens.`
        }
    ];

    private readonly model: string = 'gpt-3.5-turbo';
    private readonly temperature: number = 0.2;
    private readonly maxTokens: number = 80;

    constructor() {
        if (env.OPENAI_API_KEY) {
            const apiKey = env.OPENAI_API_KEY;
            const configuration = new Configuration({
                organization: 'org-M67dpau1dgexqczTMJdtIHp3',
                apiKey: apiKey
            });
            this.api = new OpenAIApi(configuration);
        } else {
            throw new Error(
                'No OpenAI API key found. Is the OpenAIClient is being used in the browser?'
            );
        }
    }

    async createCompletion(conversation: ChatCompletionRequestMessage[]) {
        conversation = this.preamble.concat(conversation);
        const response = await this.api.createChatCompletion({
            model: this.model,
            messages: conversation,
            temperature: this.temperature,
            max_tokens: this.maxTokens
        });

        let responseMessage = response.data.choices[0].message;
        console.log(conversation);
        console.log(responseMessage);
        if (!responseMessage) return null;

        return responseMessage;
    }
}
