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

        UI.viewport.addEventListener('contextmenu', (e) => e.preventDefault());

        UI.viewport.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                const world = window.DotEngine.screenToWorld(e.clientX, e.clientY);
                window.DotEngine.addNode(world.x, world.y);
            }
            if (e.button === 2) {
                window.DotEngine.setDragging(true);
                window.DotEngine.setLastMousePos(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            window.DotEngine.setDragging(false);
        });

        window.addEventListener('mousemove', (e) => {
            if (window.DotEngine.isDragging) {
                window.DotEngine.pan(e.clientX, e.clientY);
            }
            const world = window.DotEngine.screenToWorld(e.clientX, e.clientY);
            UI.coords.textContent = `${world.x.toFixed(0)}, ${world.y.toFixed(0)}`;
        });

        UI.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            window.DotEngine.zoom(e.deltaY, e.clientX, e.clientY);
        }, { passive: false });
    },

    loop() {
        window.DotEngine.update();
        window.DotEngine.render();
        UI.nodes.textContent = window.DotEngine.nodes.length;
        requestAnimationFrame(() => this.loop());
    }
};

window.onload = () => App.init();