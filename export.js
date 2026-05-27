const ExportManager = {
  toCSV(data, filename) {
    if (!data || data.length === 0) {
      Utils.showToast('No hay datos para exportar', 'error');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(h => {
        const val = row[h] || '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    const csv = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    Utils.showToast('Archivo CSV exportado', 'success');
  },

  toJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename + '.json';
    link.click();
    URL.revokeObjectURL(link.href);
    Utils.showToast('Archivo JSON exportado', 'success');
  },

  printPDF(title, data, headers, rows) {
    const win = window.open('', '_blank');
    if (!win) {
      Utils.showToast('Permití ventanas emergentes para exportar PDF', 'error');
      return;
    }
    let html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>${title}</title>
      <style>
        body { font-family: Segoe UI, sans-serif; padding: 2rem; color: #333; }
        h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th { background: #f4f6f9; text-align: left; padding: 0.5rem; font-size: 0.8rem; text-transform: uppercase; }
        td { padding: 0.5rem; border-bottom: 1px solid #e0e3e8; font-size: 0.85rem; }
        .footer { margin-top: 1rem; font-size: 0.75rem; color: #999; }
        .positive { color: #00a84d; } .negative { color: #ff1744; }
      </style>
      </head>
      <body>
      <h1>${title}</h1>
      <p>Generado: ${new Date().toLocaleString('es-AR')}</p>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      <div class="footer">Calculadora Financiera - Inversiones Argentina</div>
      <script>window.print();<\/script>
      </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
  },

  exportVentaBonos() {
    const data = Storage.getVentaBonos();
    if (data.length === 0) {
      Utils.showToast('No hay datos de bonos en cartera', 'error');
      return;
    }
    const headers = ['Ticket', 'Nominales', 'Compra', 'Actual', 'Ganancia', 'Rend%', 'TNA', 'TEM'];
    const rows = data.map(d => [
      d.ticket,
      d.nominales,
      '$' + d.precioCompra,
      '$' + d.precioActual,
      (d.ganPerd >= 0 ? '+$' : '-$') + Math.abs(d.ganPerd).toFixed(2),
      d.rendPct.toFixed(2) + '%',
      d.TNA.toFixed(2) + '%',
      d.TEM.toFixed(2) + '%'
    ]);
    this.printPDF('Cartera Bonos - Análisis Venta', headers, rows);
  },

  exportVentaONs() {
    const data = Storage.getVentaONs();
    if (data.length === 0) {
      Utils.showToast('No hay datos de ON en cartera', 'error');
      return;
    }
    const headers = ['Ticket', 'Nominales', 'Compra', 'Actual', 'Ganancia', 'Rend%', 'TNA', 'TEM'];
    const rows = data.map(d => [
      d.ticket,
      d.nominales,
      '$' + d.precioCompra,
      '$' + d.precioActual,
      (d.ganPerd >= 0 ? '+$' : '-$') + Math.abs(d.ganPerd).toFixed(2),
      d.rendPct.toFixed(2) + '%',
      d.TNA.toFixed(2) + '%',
      d.TEM.toFixed(2) + '%'
    ]);
    this.printPDF('Cartera ON - Análisis Venta', headers, rows);
  }
};
