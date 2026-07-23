class DotEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDragging = false;
        this.isDrawing = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.nodes = [];
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

    addNode(wx, wy) {
        if (this.nodes.length > 0) {
            const lastNode = this.nodes[this.nodes.length - 1];
            const dist = Math.hypot(wx - lastNode.x, wy - lastNode.y);
            if (dist < 5) return;
        }
        this.nodes.push({ x: wx, y: wy });
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
            y: (sy - this.viewportState.y) / this.viewportState.zoom
        };
    }

    worldToScreen(wx, wy) {
        return {
            x: wx * this.viewportState.zoom + this.viewportState.x,
            y: wy * this.viewportState.zoom + this.viewportState.y
        };
    }

    update() {
    }

    render() {
        this.clear();
        this.drawGrid();
        this.drawNodes();
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

    drawNodes() {
        const ctx = this.ctx;
        ctx.fillStyle = '#ffdf80';
        
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const screen = this.worldToScreen(node.x, node.y);
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