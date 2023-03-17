<script lang="ts">
    import type { Task } from '$lib/MatterWorld';
    export let hoveredTask: Task;
    export let tooltipX = 0;
    export let tooltipY = 0;
    export let windowHeight = 0;
    export let windowWidth = 0;

    // Calculate vertical offset
    let verticalOffset = 10;
    $: {
        if (windowHeight - tooltipY < 100) {
            verticalOffset = -80;
        } else {
            verticalOffset = 10;
        }
    }

    // Calculate horizontal offset
    let horizontalOffset = 10;
    $: {
        if (windowWidth - tooltipX < 200) {
            horizontalOffset = -110;
        } else {
            horizontalOffset = 0;
        }
    }
</script>

<div
    class="fixed z-50 bg-black bg-opacity-70 text-white px-2 py-1 text-sm rounded-md transition-transform duration-300 ease-in-out"
    style="pointer-events: none; transform: translateX({tooltipX +
        horizontalOffset}px) translateY({tooltipY + verticalOffset}px);"
>
    <div class="transition-opacity duration-300 ease-in-out">Name: {hoveredTask.name}</div>
    <div class="transition-opacity duration-300 ease-in-out">
        Sessions: {hoveredTask.sessionCount}
    </div>
    <div class="transition-opacity duration-300 ease-in-out">
        Duration: {hoveredTask.sessionDuration}
    </div>
</div>
