import * as PIXI from 'pixi.js';

type Coordinates = {
    x: number;
    y: number;
};

type Direction = 'up' | 'left' | 'down' | 'right';

const texture = PIXI.Texture.from('./ant.png');

const getNewDirection = (currentDirection: Direction, rotation: 'clockwise' | 'counter'): Direction => {
    if (rotation === 'clockwise') {
        switch (currentDirection) {
            case 'up':
                return 'right';
            case 'right':
                return 'down';
            case 'down':
                return 'left';
            case 'left':
                return 'up';
        }
    }
    switch (currentDirection) {
        case 'up':
            return 'left';
        case 'right':
            return 'up';
        case 'down':
            return 'right';
        case 'left':
            return 'down';
    }
};

export class Grid {
    cells: boolean[][];
    app: PIXI.Application;
    w: number;
    h: number;
    antPos: Coordinates;
    antDirection: Direction;
    maxAge: number;

    constructor(w: number, h: number, app: PIXI.Application) {
        this.app = app;
        this.w = w;
        this.h = h;
        this.antPos = {x: Math.floor(w / 2), y: Math.floor(h / 2)};
        this.antDirection = 'down';
        this.maxAge = 0;
        this.cells = [];
        for (let y = 0; y < h; y++) {
            const line = [];
            for (let x = 0; x < w; x++) {
                line.push(false);
            }
            this.cells.push(line);
        }
    }

    update() {
        const rotation = this.cells[this.antPos.y][this.antPos.x] ? 'clockwise' : 'counter';
        this.antDirection = getNewDirection(this.antDirection, rotation);
        switch (this.antDirection) {
            case 'up':
                this.antPos.y -= 1;
                break;
            case 'down':
                this.antPos.y += 1;
                break;
            case 'left':
                this.antPos.x -= 1;
                break;
            case 'right':
                this.antPos.x += 1;
                break;
        }
        if (this.antPos.x < 0) {
            this.antPos.x = this.w - 1;
        } else if (this.antPos.x >= this.w) {
            this.antPos.x = 0;
        }
        if (this.antPos.y < 0) {
            this.antPos.y = this.h - 1;
        } else if (this.antPos.y >= this.h) {
            this.antPos.y = 0;
        }

        this.cells[this.antPos.y][this.antPos.x] = !this.cells[this.antPos.y][this.antPos.x];
    }

    draw() {
        const scaleX = this.app.view.width / this.w;
        const scaleY = this.app.view.height / this.h;

        let backgroundGraphics = new PIXI.Graphics();
        const emptyColor = 0xffffff;
        backgroundGraphics.beginFill(emptyColor);
        backgroundGraphics.drawRect(0, 0, this.app.view.width, this.app.view.height);
        this.app.stage.addChild(backgroundGraphics);

        const fullColor = 0x010101;
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                if (!this.cells[y][x]) {
                    continue;
                }

                const graphics = new PIXI.Graphics();
                graphics.beginFill(fullColor);
                graphics.drawRect(x * scaleX, y * scaleY, scaleX, scaleY);
                this.app.stage.addChild(graphics);
            }
        }

        const ant = new PIXI.Sprite(texture);
        ant.x = this.antPos.x * scaleX + scaleX / 2;
        ant.y = this.antPos.y * scaleY + scaleY / 2;
        ant.anchor.set(0.5);
        const antScaleX = scaleX / ant.width;
        const antScaleY = scaleY / ant.height;
        ant.scale.set(antScaleX, antScaleY);

        if (this.antDirection === 'right') {
            ant.angle = 90;
        } else if (this.antDirection === 'down') {
            ant.angle = 180;
        } else if (this.antDirection === 'left') {
            ant.angle = 270;
        }
        this.app.stage.addChild(ant);
    }
}
