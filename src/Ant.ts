import * as PIXI from 'pixi.js';
import {map, toRGB} from './utils';

type Coordinates = {
    x: number;
    y: number;
};

const coordinatesToString = (c: Coordinates): string => {
    return `${c.x};${c.y}`;
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

/*
 * const colors = [
 *     [67, 87, 145] as [number, number, number],
 *     [167, 219, 17] as [number, number, number],
 *     [78, 86, 237] as [number, number, number],
 *     [209, 164, 5] as [number, number, number],
 *     [200, 98, 203] as [number, number, number],
 *     [250, 250, 46] as [number, number, number],
 *     [173, 201, 60] as [number, number, number],
 *     [165, 65, 110] as [number, number, number],
 *     [63, 191, 250] as [number, number, number]
 * ];
 */

const colors = [
    [99, 71, 77] as [number, number, number],
    [170, 118, 124] as [number, number, number],
    [214, 161, 132] as [number, number, number],
    [255, 166, 134] as [number, number, number],
    [254, 193, 150] as [number, number, number],

    [106, 78, 84] as [number, number, number],
    [113, 71, 76] as [number, number, number],
    [122, 69, 41] as [number, number, number],
    [143, 38, 0] as [number, number, number],
    [121, 51, 1] as [number, number, number]
];

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

    findGroup(start: Coordinates) {
        const visited = new Set<string>();
        const toCheck = [start];
        const group = [];
        while (toCheck.length) {
            const current = toCheck.pop();
            const {x, y} = current;
            const currentStr = coordinatesToString(current);
            if (visited.has(currentStr)) {
                continue;
            }
            group.push(current);
            visited.add(currentStr);

            if (current.x > 0 && this.cells[y][x - 1] === 0) {
                toCheck.push({x: x - 1, y});
            }
            if (current.x < this.w - 1 && this.cells[y][x + 1] === 0) {
                toCheck.push({x: x + 1, y});
            }
            if (current.y > 0 && this.cells[y - 1][x] === 0) {
                toCheck.push({x, y: y - 1});
            }
            if (current.y < this.h - 1 && this.cells[y + 1][x] === 0) {
                toCheck.push({x, y: y + 1});
            }
        }
        return group;
    }

    drawCell(coord: Coordinates, color: [number, number, number]) {
        const {x, y} = coord;
        const graphics = new PIXI.Graphics();
        graphics.beginFill(toRGB(color));
        graphics.drawRect(x * this.scaleX, y * this.scaleY, this.scaleX, this.scaleY);
        this.app.stage.addChild(graphics);
        graphics.endFill();
    }

    drawGroups() {
        const visited = new Set<string>();
        let groupsFound = 0;
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                if (this.cells[y][x] === 0) {
                    if (visited.has(coordinatesToString({x, y}))) {
                        continue;
                    }
                    groupsFound++;
                    const group = this.findGroup({x, y});
                    const color = colors[groupsFound % colors.length];

                    for (let i = 0; i < group.length; i++) {
                        const c = group[i];
                        visited.add(coordinatesToString(c));
                        this.drawCell(c, color);
                    }
                } else {
                    const color = [35, 26, 28] as [number, number, number];
                    this.drawCell({x, y}, color);
                }
            }
        }
    }

    drawAnt() {
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

    draw() {
        this.drawGroups();
        this.drawAnt();
    }
}
