import {
    Engine,
    Render,
    World,
    Bodies,
    Body,
    Query,
    Runner,
    Mouse,
    MouseConstraint
} from 'matter-js';

export interface Task {
    name: string;
    color: string;
    sessionDuration: number;
    sessionCount: number;
}

export interface TaskBody extends Body {
    task?: Task;
    originalFillColor?: string;
}

export default class MatterWorld {
    private engine: Engine;
    private render: Render;
    private world: World;
    private walls: Body[];
    private onBodyHover: (task: Task | null, x: number, y: number) => void;
    private mouseX: number;
    private mouseY: number;
    private hoveredBody: TaskBody | null;

    private readonly wallThickness = 10000;

    constructor(
        container: HTMLElement,
        backgroundColor: string = 'transparent',
        onBodyHover: (task: Task | null, x: number, y: number) => void = () => {}
    ) {
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.render = Render.create({
            element: container,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: backgroundColor
            }
        });
        this.walls = [];
        this.onBodyHover = onBodyHover;
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoveredBody = null;

        this.createWalls();
        this.setupResizeListener();
        this.setupMouseMoveListener(container);
        this.checkMouseHover();
        this.addMouseDragControls();

        Runner.run(this.engine);
        Render.run(this.render);
    }

    public spawnTask(
        task: Task,
        x: number = Math.random() * window.innerWidth,
        y: number = Math.random() * window.innerHeight
    ) {
        for (let i = 0; i < task.sessionCount; i++) {
            const circle: TaskBody = Bodies.circle(x, y, task.sessionDuration, {
                render: {
                    fillStyle: task.color,
                    lineWidth: 0,
                    strokeStyle: 'transparent',
                    opacity: 0.5
                }
            });
            circle.task = task;
            World.add(this.world, circle);
        }
    }

    private checkMouseHover() {
        const bodies = Query.point(this.world.bodies, { x: this.mouseX, y: this.mouseY });

        // Reset the fill color of the previously hovered circle.
        if (this.hoveredBody) {
            this.hoveredBody.render.fillStyle = this.hoveredBody.originalFillColor;
        }

        if (bodies.length > 0) {
            const body: TaskBody = bodies[0];

            if (body.task) {
                // Highlight the circle by changing its fill color.
                this.hoveredBody = body;
                body.originalFillColor = body.render.fillStyle;
                body.render.fillStyle = '#FFD700';

                this.onBodyHover(body.task, this.mouseX + 10, this.mouseY + 10);
            } else {
                this.hoveredBody = null;
                this.onBodyHover(null, 0, 0);
            }
        } else {
            this.hoveredBody = null;
            this.onBodyHover(null, 0, 0);
        }

        requestAnimationFrame(() => this.checkMouseHover());
    }

    private addMouseDragControls() {
        const mouse = Mouse.create(this.render.canvas);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        World.add(this.world, mouseConstraint);
    }

    private setupMouseMoveListener(container: HTMLElement) {
        container.addEventListener('mousemove', (event) => {
            const { offsetX, offsetY } = event;
            this.mouseX = offsetX;
            this.mouseY = offsetY;
        });
    }

    private setupResizeListener() {
        window.addEventListener('resize', () => {
            const { innerWidth: width, innerHeight: height } = window;
            this.render.canvas.width = width;
            this.render.canvas.height = height;
            this.render.options.width = width;
            this.render.options.height = height;

            this.resizeWalls(width, height);
        });
    }

    private resizeWalls(width: number, height: number) {
        const [topWall, bottomWall, leftWall, rightWall] = this.walls;
        const halfWallThickness = this.wallThickness / 2;

        Body.setPosition(topWall, { x: width / 2, y: -halfWallThickness });
        Body.setPosition(bottomWall, { x: width / 2, y: height + halfWallThickness });
        Body.setPosition(leftWall, { x: -halfWallThickness, y: height / 2 });
        Body.setPosition(rightWall, { x: width + halfWallThickness, y: height / 2 });

        Body.setVertices(topWall, [
            { x: -this.wallThickness, y: 0 },
            { x: width + this.wallThickness, y: 0 },
            { x: width + this.wallThickness, y: this.wallThickness },
            { x: -this.wallThickness, y: this.wallThickness }
        ]);
        Body.setVertices(bottomWall, [
            { x: -this.wallThickness, y: 0 },
            { x: width + this.wallThickness, y: 0 },
            { x: width + this.wallThickness, y: this.wallThickness },
            { x: -this.wallThickness, y: this.wallThickness }
        ]);
        Body.setVertices(leftWall, [
            { x: 0, y: -this.wallThickness },
            { x: this.wallThickness, y: -this.wallThickness },
            { x: this.wallThickness, y: height + this.wallThickness },
            { x: 0, y: height + this.wallThickness }
        ]);
        Body.setVertices(rightWall, [
            { x: 0, y: -this.wallThickness },
            { x: this.wallThickness, y: -this.wallThickness },
            { x: this.wallThickness, y: height + this.wallThickness },
            { x: 0, y: height + this.wallThickness }
        ]);
    }
    private createWalls() {
        const wallOptions = {
            isStatic: true,
            render: { fillStyle: '#000000' }
        };

        const halfWallThickness = this.wallThickness / 2;
        const width = window.innerWidth;
        const height = window.innerHeight;

        const topWall = Bodies.rectangle(
            width / 2,
            -halfWallThickness,
            width + this.wallThickness * 2,
            this.wallThickness,
            wallOptions
        );
        const bottomWall = Bodies.rectangle(
            width / 2,
            height + halfWallThickness,
            width + this.wallThickness * 2,
            this.wallThickness,
            wallOptions
        );
        const leftWall = Bodies.rectangle(
            -halfWallThickness,
            height / 2,
            this.wallThickness,
            height + this.wallThickness * 2,
            wallOptions
        );
        const rightWall = Bodies.rectangle(
            width + halfWallThickness,
            height / 2,
            this.wallThickness,
            height + this.wallThickness * 2,
            wallOptions
        );

        this.walls = [topWall, bottomWall, leftWall, rightWall];
        World.add(this.world, this.walls);
    }
}
