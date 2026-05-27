const ChartManager = {
  _charts: {},

  renderBar(id, labels, values, label, color = '#00c853') {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 250 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '250px';
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 250;
    const pad = { top: 20, bottom: 40, left: 50, right: 20 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);
    const maxVal = Math.max(...values.map(Math.abs), 1);
    const barW = chartW / labels.length * 0.6;
    const gap = chartW / labels.length * 0.4;

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const textColor = isDark ? '#9aa0b0' : '#5f6577';
    const gridColor = isDark ? '#2a2d3a' : '#e0e3e8';

    ctx.fillStyle = textColor;
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';

    values.forEach((v, i) => {
      const x = pad.left + i * (barW + gap) + gap / 2;
      const barH = (Math.abs(v) / maxVal) * chartH;
      const y = v >= 0 ? pad.top + chartH - barH : pad.top + chartH;

      ctx.fillStyle = v >= 0 ? color : '#ff1744';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.fillText(labels[i], x + barW / 2, pad.top + chartH + 18);

      ctx.fillStyle = v >= 0 ? color : '#ff1744';
      ctx.font = 'bold 10px Segoe UI, sans-serif';
      ctx.fillText(v.toFixed(1) + '%', x + barW / 2, v >= 0 ? y - 6 : y + barH + 14);
      ctx.font = '11px Segoe UI, sans-serif';
    });

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }
  },

  initCanvas(id) {
    const container = document.getElementById(id);
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.id = id + 'Canvas';
    canvas.style.width = '100%';
    container.appendChild(canvas);
  }
};

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    const r = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
    const [tl, tr, br, bl] = r.map(v => Math.min(v || 0, Math.min(w, h) / 2));
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
  };
}
