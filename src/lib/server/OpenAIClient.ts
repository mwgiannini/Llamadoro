import { env } from '$env/dynamic/private';
import { Configuration, OpenAIApi } from 'openai';
import type { ChatCompletionRequestMessage } from 'openai';

export default class OpenAIClient {
    private api: OpenAIApi;
    private readonly model: string = 'gpt-3.5-turbo';
    private readonly temperature: number = 0;
    private readonly maxTokens: number = 50;

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

    async createCompletion(message: string) {
        const response = await this.api.createChatCompletion({
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a useful and objective tool that creates tasks called TaskGPT. 
                    You will receive input from a user looking to create a task.
                    Your job is to help them create actionable tasks that they can complete while asking as few questions as possible.
                    You will return one of two responses:
                    1. An isolated task definition string in TaskGPT syntax (see examples). It will contain the name of the task the user is asking to create and an estimated session length and number of sessions it will take to complete.
                    2. A supportive response that indicates that the user's input was not understood or not actionable, and how they can improve their input. You might suggest an actionable task (do not use the TaskGPT syntax).
                    Here are some examples of how you might interact with the user:
                    User: I want to learn how to play the guitar.
                    You: That sounds like a great idea! How about learning a song?
                    User: I want to learn how to play Little Wing by Jimi Hendrix.
                    You: "Learn Little Wing by Jimi Hendrix, 30, 3"
                    User: I want to walk my dog.
                    You: "Walk the dog, 5, 1"
                    User: I need to brush my teeth.
                    You: "Brush teeth, 1, 1"
                    User: I want to go swimming for half an hour every day this week.
                    You: "Swim every day this week, 30, 7"
                    User: I need to go shopping before my friend comes over
                    You: "Go shopping, 30, 1"
                    `
                },
                {
                    role: 'user',
                    content: `${message}`
                }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens
        });
        response.data.choices[0].message?.content;
        return response.data.choices[0].message?.content;
    }
}
