<script lang="ts">
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import MatterWorld from '$lib/MatterWorld';
    import { chatHistory } from '../stores/chatStore';
    import TaskTooltip from '../components/TaskTooltip.svelte';
    import type { Task } from '$lib/MatterWorld';
    import type { ChatCompletionRequestMessage } from 'openai';
    import type { ActionResult } from '@sveltejs/kit';
    let container: HTMLElement;
    let matterWorld: MatterWorld;
    let taskInput: HTMLInputElement;
    let displayedText: string;
    let hoveredTask: Task | null = null;
    let tooltipX = 0;
    let tooltipY = 0;
    export let data; // this is the data passed to the page on load
    export let form; // this is the data returned from the server processing the form

    onMount(() => {
        window.addEventListener('keydown', handleKeyPress);
        matterWorld = new MatterWorld(container, 'transparent', handleBodyHover);
    });

    function handleBodyHover(task: Task | null, x: number, y: number) {
        hoveredTask = task;

        if (task) {
            tooltipX = x;
            tooltipY = y;
        }
    }

    function handleSubmit(event: Event) {
        event.preventDefault();
    }

    // Always focus the input field
    function handleKeyPress(event: KeyboardEvent) {
        if (taskInput) {
            taskInput.focus();
        }
        if (event.key === '+') {
            matterWorld.spawnTask({
                name: 'Test',
                color: getRandomHexColor(),
                sessionDuration: 30,
                sessionCount: 10
            });
        }
    }

    function getTaskFromResponse(input: string): Task | null {
        const jsonPattern = /(\{[^\}]*\})/;
        const match = input.match(jsonPattern);

        if (match) {
            try {
                const task = JSON.parse(match[0]);
                if (
                    task.name &&
                    typeof task.duration === 'number' &&
                    typeof task.sessions === 'number'
                ) {
                    return {
                        name: task.name,
                        color: getRandomHexColor(),
                        sessionDuration: task.duration,
                        sessionCount: task.sessions
                    };
                }
            } catch (error) {}
        }
        return null;
    }

    function getRandomHexColor(): string {
        const randomColor = Math.floor(Math.random() * 16777215);
        return '#' + randomColor.toString(16).padStart(6, '0');
    }

    function processResponse(response: ActionResult) {
        if (response.type === 'error') {
            console.error(response.error);
            return;
        } else if (response.type === 'success') {
            const { data } = response;
            if (data) {
                const assistantResponse = data as ChatCompletionRequestMessage;
                $chatHistory.push(assistantResponse);
                const task = getTaskFromResponse(data.content);
                if (task) {
                    matterWorld.spawnTask(task);
                    displayedText = 'Task Created!';
                    $chatHistory = [];
                } else {
                    displayedText = assistantResponse.content;
                }
            }
        }
    }
</script>

{#if displayedText}
    <div
        class="z-20 fixed inset-x-0 top-0 flex flex-col items-center justify-center text-center whitespace-pre-line pointer-events-none space-y-4"
    >
        <div
            class="mt-4 p-4 rounded-xl bg-opacity-30 backdrop-blur-md bg-black w-2/3 text-lg text-white select-none pointer-events-auto"
        >
            {displayedText}
        </div>
    </div>
{/if}

{#if hoveredTask}
    <TaskTooltip
        {hoveredTask}
        {tooltipX}
        {tooltipY}
        windowHeight={window.innerHeight}
        windowWidth={window.innerWidth}
    />
{/if}

<form
    use:enhance={({ data }) => {
        const message = data.get('message');
        if (message) {
            $chatHistory.push({ role: 'user', content: message.toString() });
        }
        data.set('chatHistory', JSON.stringify($chatHistory));

        return async ({ result, update }) => {
            if (result.type === 'success' && result.data) {
                processResponse(result);
                update();
            }
        };
    }}
    method="POST"
    action="?/getCompletion"
    on:submit={handleSubmit}
>
    <input
        name="message"
        bind:this={taskInput}
        class="z-30 fixed top-[40%] inset-x-0 mx-auto w-full sm:w-1/2 bg-opacity-40 bg-white text-black rounded-full px-5 py-3 text-lg border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 backdrop-blur-md shadow-md transition-shadow duration-300 ease-in-out"
        type="text"
        placeholder="What do you want to get done?"
    />
    <button type="submit" hidden>Submit</button>
</form>
<div class="relative w-full h-screen overflow-hidden" bind:this={container} />
