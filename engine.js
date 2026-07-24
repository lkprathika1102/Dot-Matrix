class DotEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDragging = false;
        this.isDrawing = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.nodes = [];
        this.spatialHash = {};
        this.history = [];
        this.redoStack = [];
        this.connectDistance = 150;
        this.chunkSize = 400;
        this.viewportState = {
            x: 0,
            y: 0,
            zoom: 1,
            width: canvas.width,
            height: canvas.height
        };
    }

    updateViewportSize() {
        this.viewportState.width = this.canvas.width;
        this.viewportState.height = this.canvas.height;
    }

    setDragging(state) {
        this.isDragging = state;
    }

    setDrawing(state) {
        this.isDrawing = state;
    }

    setLastMousePos(x, y) {
        this.lastMouseX = x;
        this.lastMouseY = y;
    }

    getChunkKey(wx, wy) {
        const cx = Math.floor(wx / this.chunkSize);
        const cy = Math.floor(wy / this.chunkSize);
        return `${cx},${cy}`;
    }

    saveState() {
        this.history.push(JSON.stringify(this.nodes));
        if (this.history.length > 50) this.history.shift();
        this.redoStack = [];
    }

    undo() {
        if (this.history.length === 0) return;
        this.redoStack.push(JSON.stringify(this.nodes));
        this.nodes = JSON.parse(this.history.pop());
        this.rebuildSpatialHash();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        this.history.push(JSON.stringify(this.nodes));
        this.nodes = JSON.parse(this.redoStack.pop());
        this.rebuildSpatialHash();
    }

    rebuildSpatialHash() {
        this.spatialHash = {};
        this.nodes.forEach(node => {
            const key = this.getChunkKey(node.x, node.y);
            if (!this.spatialHash[key]) this.spatialHash[key] = [];
            this.spatialHash[key].push(node);
        });
    }

    addNode(wx, wy) {
        if (this.nodes.length > 0) {
            const lastNode = this.nodes[this.nodes.length - 1];
            const dist = Math.hypot(wx - lastNode.x, wy - lastNode.y);
            if (dist < 5) return;
        }
        const node = { x: wx, y: wy };
        this.nodes.push(node);
        const key = this.getChunkKey(wx, wy);
        if (!this.spatialHash[key]) this.spatialHash[key] = [];
        this.spatialHash[key].push(node);
    }

    clearNodes() {
        this.nodes = [];
        this.spatialHash = {};
    }

    pan(mouseX, mouseY) {
        const dx = mouseX - this.lastMouseX;
        const dy = mouseY - this.lastMouseY;
        this.viewportState.x += dx;
        this.viewportState.y += dy;
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
    }

    zoom(delta, mouseX, mouseY) {
        const zoomSpeed = 0.001;
        const factor = Math.exp(-delta * zoomSpeed);
        const oldZoom = this.viewportState.zoom;
        const newZoom = Math.min(Math.max(oldZoom * factor, 0.01), 10);
        const worldPos = this.screenToWorld(mouseX, mouseY);
        this.viewportState.zoom = newZoom;
        this.viewportState.x = mouseX - worldPos.x * newZoom;
        this.viewportState.y = mouseY - worldPos.y * newZoom;
    }

    screenToWorld(sx, sy) {
        return {
            x: (sx - this.viewportState.x) / this.viewportState.zoom,
            y: (sy - 35 - this.viewportState.y) / this.viewportState.zoom
        };
    }

    worldToScreen(wx, wy) {
        return {
            x: wx * this.viewportState.zoom + this.viewportState.x,
            y: wy * this.viewportState.zoom + this.viewportState.y
        };
    }

    generateDeterministicNodes(cx, cy) {
        const seed = (cx * 73856093) ^ (cy * 19349663);
        const points = [];
        const count = (Math.abs(seed) % 3) + 1;
        for (let i = 0; i < count; i++) {
            const px = (Math.abs(seed ^ (i * 12345)) % this.chunkSize);
            const py = (Math.abs(seed ^ (i * 67890)) % this.chunkSize);
            points.push({ x: cx * this.chunkSize + px, y: cy * this.chunkSize + py });
        }
        return points;
    }

    exportPNG() {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = this.viewportState.width;
        offCanvas.height = this.viewportState.height;
        const octx = offCanvas.getContext('2d');
        
        octx.fillStyle = '#000';
        octx.fillRect(0, 0, offCanvas.width, offCanvas.height);
        
        const scaledStep = 100 * this.viewportState.zoom;
        octx.strokeStyle = '#1a1c17';
        octx.lineWidth = 1;
        octx.beginPath();
        for (let x = this.viewportState.x % scaledStep; x < offCanvas.width; x += scaledStep) {
            octx.moveTo(x, 0); octx.lineTo(x, offCanvas.height);
        }
        for (let y = this.viewportState.y % scaledStep; y < offCanvas.height; y += scaledStep) {
            octx.moveTo(0, y); octx.lineTo(offCanvas.width, y);
        }
        octx.stroke();

        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(offCanvas.width, offCanvas.height);
        const startCX = Math.floor(topLeft.x / this.chunkSize);
        const startCY = Math.floor(topLeft.y / this.chunkSize);
        const endCX = Math.floor(bottomRight.x / this.chunkSize);
        const endCY = Math.floor(bottomRight.y / this.chunkSize);

        let renderNodes = [...this.nodes];
        for (let cx = startCX; cx <= endCX; cx++) {
            for (let cy = startCY; cy <= endCY; cy++) {
                renderNodes.push(...this.generateDeterministicNodes(cx, cy));
            }
        }

        octx.strokeStyle = '#4a4d3f';
        for (let i = 0; i < renderNodes.length; i++) {
            for (let j = i + 1; j < renderNodes.length; j++) {
                const dist = Math.hypot(renderNodes[i].x - renderNodes[j].x, renderNodes[i].y - renderNodes[j].y);
                if (dist < this.connectDistance) {
                    const s1 = this.worldToScreen(renderNodes[i].x, renderNodes[i].y);
                    const s2 = this.worldToScreen(renderNodes[j].x, renderNodes[j].y);
                    octx.beginPath();
                    octx.moveTo(s1.x, s1.y);
                    octx.lineTo(s2.x, s2.y);
                    octx.stroke();
                }
            }
        }

        octx.fillStyle = '#ffdf80';
        renderNodes.forEach(n => {
            const s = this.worldToScreen(n.x, n.y);
            octx.fillRect(s.x - 2, s.y - 2, 4, 4);
        });

        const link = document.createElement('a');
        link.download = `dot-matrix_capture_${Date.now()}.png`;
        link.href = offCanvas.toDataURL('image/png', 1.0);
        link.click();
    }

    update() {
    }

    render(autoGen) {
        this.clear();
        this.drawGrid();
        
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(this.viewportState.width, this.viewportState.height);
        const startCX = Math.floor(topLeft.x / this.chunkSize);
        const startCY = Math.floor(topLeft.y / this.chunkSize);
        const endCX = Math.floor(bottomRight.x / this.chunkSize);
        const endCY = Math.floor(bottomRight.y / this.chunkSize);

        let visibleNodes = [];
        let activeChunks = [];

        for (let cx = startCX; cx <= endCX; cx++) {
            for (let cy = startCY; cy <= endCY; cy++) {
                const key = `${cx},${cy}`;
                activeChunks.push({cx, cy, key});
                if (this.spatialHash[key]) {
                    visibleNodes.push(...this.spatialHash[key]);
                }
                if (autoGen) {
                    visibleNodes.push(...this.generateDeterministicNodes(cx, cy));
                }
            }
        }

        this.drawConnections(visibleNodes, activeChunks);
        this.drawNodes(visibleNodes);
        this.drawOverlay();
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.viewportState.width, this.viewportState.height);
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = '#1a1c17';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const step = 100 * this.viewportState.zoom;
        const startX = this.viewportState.x % step;
        const startY = this.viewportState.y % step;
        for (let x = startX; x < this.viewportState.width; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.viewportState.height);
        }
        for (let y = startY; y < this.viewportState.height; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.viewportState.width, y);
        }
        ctx.stroke();
    }

    drawConnections(nodes, activeChunks) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#4a4d3f';
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            const n1 = nodes[i];
            const cx = Math.floor(n1.x / this.chunkSize);
            const cy = Math.floor(n1.y / this.chunkSize);

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const key = `${cx + dx},${cy + dy}`;
                    const neighbors = this.spatialHash[key] || [];
                    neighbors.forEach(n2 => {
                        if (n1 === n2) return;
                        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                        if (dist < this.connectDistance) {
                            const s1 = this.worldToScreen(n1.x, n1.y);
                            const s2 = this.worldToScreen(n2.x, n2.y);
                            ctx.beginPath();
                            ctx.moveTo(s1.x, s1.y);
                            ctx.lineTo(s2.x, s2.y);
                            ctx.stroke();
                        }
                    });
                }
            }
        }
    }

    drawNodes(nodes) {
        const ctx = this.ctx;
        ctx.fillStyle = '#ffdf80';
        for (let i = 0; i < nodes.length; i++) {
            const screen = this.worldToScreen(nodes[i].x, nodes[i].y);
            ctx.fillRect(screen.x - 2, screen.y - 2, 4, 4);
        }
    }

    drawOverlay() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < this.viewportState.height; i += 4) {
            ctx.fillRect(0, i, this.viewportState.width, 1);
        }
    }
}