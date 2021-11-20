import * as PIXI from 'pixi.js';
import {Grid} from './Ant';

const app = new PIXI.Application({width: 800, height: 800});
document.getElementById('container').appendChild(app.view);

const type = PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas';
const grid = new Grid(100, 100, app);

function draw() {
    for (var i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }
    for (let _ = 0; _ < 200; _++) {
        grid.update();
    }
    grid.update();
    grid.draw();
    requestAnimationFrame(draw);
}
draw();
