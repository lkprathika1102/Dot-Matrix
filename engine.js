class DotEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
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


    drawOverlay() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < this.viewportState.height; i += 4) {
            ctx.fillRect(0, i, this.viewportState.width, 1);
        }
    }
}