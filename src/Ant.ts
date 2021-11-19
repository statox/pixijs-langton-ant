import * as PIXI from 'pixi.js';
import {map, toRGB} from './utils';

type Coordinates = {
    x: number;
    y: number;
};

type Direction = 'up' | 'left' | 'down' | 'right';

const texture = PIXI.Texture.from('./ant.png');

const getNewDirection = (currentDirection: Direction, rotation: Rotation): Direction => {
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

type Rotation = 'clockwise' | 'counter';

type AntParams = {
    step: {
        full: number;
        empty: number;
    };
    rotation: {
        full: Rotation;
        empty: Rotation;
    };
};

export class Grid {
    cells: number[][];
    app: PIXI.Application;
    w: number;
    h: number;
    antPos: Coordinates;
    antDirection: Direction;
    antParams: AntParams;
    iteration: number;
    scaleX: number;
    scaleY: number;

    constructor(w: number, h: number, app: PIXI.Application) {
        this.app = app;
        this.w = w;
        this.h = h;
        this.scaleX = this.app.view.width / this.w;
        this.scaleY = this.app.view.height / this.h;

        this.antParams = {
            step: {
                full: 1,
                empty: 1
            },
            rotation: {
                full: 'clockwise',
                empty: 'counter'
            }
        };

        this.antPos = {x: Math.floor(w / 2), y: Math.floor(h / 2)};
        this.antDirection = 'down';
        this.iteration = 0;
        this.cells = [];
        for (let y = 0; y < h; y++) {
            const line = [];
            for (let x = 0; x < w; x++) {
                line.push(0);
            }
            this.cells.push(line);
        }
    }

    update() {
        this.iteration++;
        const isEmptyCell = this.cells[this.antPos.y][this.antPos.x] === 0;
        const rotation = isEmptyCell ? this.antParams.rotation['empty'] : this.antParams.rotation['full'];
        const step = isEmptyCell ? this.antParams.step['empty'] : this.antParams.step['full'];

        this.antDirection = getNewDirection(this.antDirection, rotation);
        switch (this.antDirection) {
            case 'up':
                this.antPos.y -= step;
                break;
            case 'down':
                this.antPos.y += step;
                break;
            case 'left':
                this.antPos.x -= step;
                break;
            case 'right':
                this.antPos.x += step;
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

        if (this.cells[this.antPos.y][this.antPos.x]) {
            this.cells[this.antPos.y][this.antPos.x] = 0;
        } else {
            this.cells[this.antPos.y][this.antPos.x] = this.iteration;
        }
    }

    draw() {
        let backgroundGraphics = new PIXI.Graphics();
        const emptyColor = 0xffffff;
        backgroundGraphics.beginFill(emptyColor);
        backgroundGraphics.drawRect(0, 0, this.app.view.width, this.app.view.height);
        backgroundGraphics.endFill();
        this.app.stage.addChild(backgroundGraphics);

        const fullColor = 0x010101;
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                if (this.cells[y][x] === 0) {
                    continue;
                }

                const level = map(this.cells[y][x], 0, this.iteration, 250, 0);
                const color = toRGB([level, level, level]);

                const graphics = new PIXI.Graphics();
                graphics.beginFill(color);
                graphics.drawRect(x * this.scaleX, y * this.scaleY, this.scaleX, this.scaleY);
                this.app.stage.addChild(graphics);
            }
        }

        const ant = new PIXI.Sprite(texture);
        ant.x = this.antPos.x * this.scaleX + this.scaleX / 2;
        ant.y = this.antPos.y * this.scaleY + this.scaleY / 2;
        ant.anchor.set(0.5);
        const antScaleX = this.scaleX / ant.width;
        const antScaleY = this.scaleY / ant.height;
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
