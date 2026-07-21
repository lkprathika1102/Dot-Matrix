const UI = {
    coords: document.getElementById('coord-val'),
    nodes: document.getElementById('node-val'),
    status: document.getElementById('sys-status'),
    viewport: document.getElementById('main-viewport')
};

const App = {
    init() {
        this.setupCanvas();
        this.bootEngine();
        this.loop();
    },

    setupCanvas() {
        UI.viewport.width = UI.viewport.clientWidth;
        UI.viewport.height = UI.viewport.clientHeight;
    },

    bootEngine() {
        window.DotEngine = new DotEngine(UI.viewport);
    },

    loop() {
        window.DotEngine.update();
        window.DotEngine.render();
        requestAnimationFrame(() => this.loop());
    }
};

window.onload = () => App.init();