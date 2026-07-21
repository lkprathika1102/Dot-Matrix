const UI = {
    coords: document.getElementById('coord-val'),
    nodes: document.getElementById('node-val'),
    viewport: document.getElementById('main-viewport'),
    toggleGen: document.getElementById('toggle-gen')
};

const App = {
    init() {
        this.setupCanvas();
        this.bootEngine();
        this.bindInputs();
        this.loop();
    },

    setupCanvas() {
        UI.viewport.width = UI.viewport.clientWidth;
        UI.viewport.height = UI.viewport.clientHeight;
    },

    bootEngine() {
        window.DotEngine = new DotEngine(UI.viewport);
    },

    bindInputs() {
        window.addEventListener('resize', () => {
            UI.viewport.width = UI.viewport.clientWidth;
            UI.viewport.height = UI.viewport.clientHeight;
            window.DotEngine.updateViewportSize();
        });
    },

    loop() {
        window.DotEngine.update();
        window.DotEngine.render();
        requestAnimationFrame(() => this.loop());
    }
};

window.onload = () => App.init();