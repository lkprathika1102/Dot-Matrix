const UI = {
    coords: document.getElementById('coord-val'),
    nodes: document.getElementById('node-val'),
    viewport: document.getElementById('main-viewport'),
    toggleGen: document.getElementById('toggle-gen'),
    clearBtn: document.getElementById('clear-btn'),
    undoBtn: document.getElementById('undo-btn'),
    redoBtn: document.getElementById('redo-btn')
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
                window.DotEngine.saveState();
                window.DotEngine.setDrawing(true);
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
            window.DotEngine.setDrawing(false);
        });

        window.addEventListener('mousemove', (e) => {
            if (window.DotEngine.isDragging) {
                window.DotEngine.pan(e.clientX, e.clientY);
            }
            
            if (window.DotEngine.isDrawing) {
                const world = window.DotEngine.screenToWorld(e.clientX, e.clientY);
                window.DotEngine.addNode(world.x, world.y);
            }

            const world = window.DotEngine.screenToWorld(e.clientX, e.clientY);
            UI.coords.textContent = `${world.x.toFixed(0)}, ${world.y.toFixed(0)}`;
        });

        UI.viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            window.DotEngine.zoom(e.deltaY, e.clientX, e.clientY);
        }, { passive: false });

        UI.clearBtn.addEventListener('click', () => {
            window.DotEngine.saveState();
            window.DotEngine.clearNodes();
        });

        UI.undoBtn.addEventListener('click', () => {
            window.DotEngine.undo();
        });

        UI.redoBtn.addEventListener('click', () => {
            window.DotEngine.redo();
        });
    },

    loop() {
        window.DotEngine.update();
        window.DotEngine.render(UI.toggleGen.checked);
        UI.nodes.textContent = window.DotEngine.nodes.length;
        requestAnimationFrame(() => this.loop());
    }
};

window.onload = () => App.init();