class DotEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = {
            width: canvas.width,
            height: canvas.height,
            offsetX: 0,
            offsetY: 0,
            zoom: 1
        };
    }

    update() {
    }

    render() {
        this.clear();
        this.drawGrid();
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.state.width, this.state.height);
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = '#1a1c17';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const step = 50 * this.state.zoom;
        
        for (let x = 0; x < this.state.width; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.state.height);
        }
        
        for (let y = 0; y < this.state.height; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.state.width, y);
        }
        
        
        ctx.stroke();
    }
}