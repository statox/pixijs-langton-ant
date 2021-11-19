import * as PIXI from 'pixi.js';
import {Grid} from './Ant';

const app = new PIXI.Application({width: 600, height: 600});
document.getElementById('container').appendChild(app.view);

const grid = new Grid(200, 200, app);

function draw() {
    for (var i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }
    for (let _ = 0; _ < 100; _++) {
        grid.update();
    }
    grid.draw();
    requestAnimationFrame(draw);
}
draw();