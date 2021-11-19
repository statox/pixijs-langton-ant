import * as PIXI from 'pixi.js';

export class Grid {
    cells: boolean[][];
    app: PIXI.Application;
    w: number;
    h: number;

    constructor(w: number, h: number, app: PIXI.Application) {
        this.app = app;
        this.w = w;
        this.h = h;
        this.cells = [];
        for (let y = 0; y < h; y++) {
            const line = [];
            for (let x = 0; x < w; x++) {
                line.push(Math.random() > 0.5);
            }
            this.cells.push(line);
        }
    }

    nextCellState(row, col) {
        let neighborCount = 0;
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                if (rowOffset === 0 && colOffset === 0) {
                    continue;
                }
                const newRow = row + rowOffset;
                const newCol = col + colOffset;

                if (newRow < 0 || newRow >= this.h || newCol < 0 || newCol >= this.w) {
                    continue;
                }

                if (this.cells[newRow][newCol]) {
                    neighborCount += 1;
                }
            }
        }

        if (this.cells[row][col]) {
            if (neighborCount === 2 || neighborCount === 3) {
                return true;
            }
        } else if (neighborCount === 3) {
            return true;
        }

        return false;
    }

    update() {
        const nextBoard = [];
        for (let y = 0; y < this.h; y++) {
            nextBoard.push([]);
            for (let x = 0; x < this.w; x++) {
                nextBoard[y].push(this.nextCellState(y, x));
            }
        }
        this.cells = nextBoard;

        // setTimeout(() => this.update(), 1);
    }

    draw() {
        const scaleX = this.app.view.width / this.w;
        const scaleY = this.app.view.height / this.h;
        for (let x = 0; x < this.w; x++) {
            for (let y = 0; y < this.h; y++) {
                let graphics = new PIXI.Graphics();
                let color = 0x010101;
                if (this.cells[y][x]) {
                    color = 0xffffff;
                }
                graphics.beginFill(color);
                graphics.lineStyle(1, 0x101010);
                graphics.drawRect(x * scaleX, y * scaleY, scaleX, scaleY);
                this.app.stage.addChild(graphics);
            }
        }
    }
}
