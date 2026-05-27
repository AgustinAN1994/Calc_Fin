const Analytics = {
  renderBonoResults(result) {
    const r = document.getElementById('bonoResults');
    r.style.display = 'block';

    const isPos = (v) => v >= 0;
    const setVal = (id, val, className = '') => {
      const el = document.getElementById(id);
      el.textContent = val;
      el.className = 'result-value' + (className ? ' ' + className : '');
    };

    setVal('bonoRendEst', Utils.formatMoney(result.valorFinal), isPos(result.valorFinal) ? 'positive' : 'negative');
    setVal('bonoTotalNeto', Utils.formatMoney(result.totalNetoARetirar), isPos(result.totalNetoARetirar) ? 'positive' : 'negative');
    setVal('bonoGanNetaFinal', Utils.formatMoney(result.gananciaNetaFinal), isPos(result.gananciaNetaFinal) ? 'positive' : 'negative');
    setVal('bonoRendMensual', Utils.formatPercent(result.rendMensual));
    setVal('bonoTEM', Utils.formatPercent(result.TEM));
    setVal('bonoSpreadReal', Utils.formatPercent(result.difInflacion), isPos(result.difInflacion) ? 'positive' : 'negative');
    setVal('bonoRendAnual', Utils.formatPercent(result.rendAnual));

    const pf = document.getElementById('bonoVsPF');
    pf.textContent = Utils.formatPercent(result.difPF);
    pf.className = 'comp-value ' + (result.difPF >= 0 ? 'positive' : 'negative');

    const mp = document.getElementById('bonoVsMP');
    mp.textContent = Utils.formatPercent(result.difMP);
    mp.className = 'comp-value ' + (result.difMP >= 0 ? 'positive' : 'negative');

    const inf = document.getElementById('bonoVsInflacion');
    inf.textContent = Utils.formatPercent(result.difInflacion);
    inf.className = 'comp-value ' + (result.difInflacion >= 0 ? 'positive' : 'negative');

    const analysis = Calculator.analyzeAttractiveness(result);
    const textEl = document.getElementById('bonoAnalysisText');
    const box = document.getElementById('bonoAnalysis');
    const badge = document.getElementById('bonoAttrBadge');

    result.atractivo = analysis.nivel;

    box.className = 'analysis-box';
    if (analysis.nivel === 'ALTO') box.classList.add('success');
    else if (analysis.nivel === 'MEDIO') box.classList.add('warning');
    else box.classList.add('danger');

    // Días al vencimiento
    const diasEl = document.getElementById('bonoDias');
    if (diasEl) diasEl.textContent = result.dias + ' días';

    // Texto de análisis: TEM vs benchmarks mensualizados
    const TEM = result.TEM || 0;
    const difInflacion = result.difInflacion || 0;
    const difPF = result.difPF || 0;
    const difMP = result.difMP || 0;

    let text = `Instrumento de ${result.plazo || 'corto plazo'}. `;
    text += `TEM efectiva: ${Utils.formatPercent(TEM)}. `;
    text += `Rendimiento total del período: ${Utils.formatPercent(result.rendPeriodo)}. `;

    let supera = [];
    let noSupera = [];
    if (difMP > 0) supera.push('Mercado Pago');
    else noSupera.push('Mercado Pago');
    if (difPF > 0) supera.push('Plazo Fijo');
    else noSupera.push('Plazo Fijo');
    if (difInflacion > 0) supera.push('inflación');
    else noSupera.push('inflación');

    if (supera.length > 0) text += `Supera: ${supera.join(', ')}. `;
    if (noSupera.length > 0) text += `No supera: ${noSupera.join(', ')}. `;

    if (difInflacion > 0) {
      text += `Spread real positivo (${Utils.formatPercent(difInflacion)}): preserva poder adquisitivo.`;
    } else {
      text += `Spread real negativo (${Utils.formatPercent(difInflacion)}): pierde poder adquisitivo.`;
    }

    textEl.textContent = text;
    badge.textContent = analysis.nivel;
    badge.className = 'attr-badge ' + analysis.nivel.toLowerCase();
  },

  renderONResults(result) {
    const r = document.getElementById('onResults');
    r.style.display = 'block';

    const isPos = (v) => v >= 0;
    const setVal = (id, val, className = '') => {
      const el = document.getElementById(id);
      el.textContent = val;
      el.className = 'result-value' + (className ? ' ' + className : '');
    };

    setVal('onRendEst', Utils.formatMoney(result.valorFinal), isPos(result.valorFinal) ? 'positive' : 'negative');
    setVal('onTotalNeto', Utils.formatMoney(result.totalNetoARetirar), isPos(result.totalNetoARetirar) ? 'positive' : 'negative');
    setVal('onGanNetaFinal', Utils.formatMoney(result.gananciaNetaFinal), isPos(result.gananciaNetaFinal) ? 'positive' : 'negative');
    setVal('onRendMensual', Utils.formatPercent(result.rendMensual));
    setVal('onTEM', Utils.formatPercent(result.TEM));
    setVal('onSpreadReal', Utils.formatPercent(result.difInflacion), isPos(result.difInflacion) ? 'positive' : 'negative');
    setVal('onRendAnual', Utils.formatPercent(result.rendAnual));

    const pf = document.getElementById('onVsPF');
    pf.textContent = Utils.formatPercent(result.difPF);
    pf.className = 'comp-value ' + (result.difPF >= 0 ? 'positive' : 'negative');

    const mp = document.getElementById('onVsMP');
    mp.textContent = Utils.formatPercent(result.difMP);
    mp.className = 'comp-value ' + (result.difMP >= 0 ? 'positive' : 'negative');

    const inf = document.getElementById('onVsInflacion');
    inf.textContent = Utils.formatPercent(result.difInflacion);
    inf.className = 'comp-value ' + (result.difInflacion >= 0 ? 'positive' : 'negative');

    const analysis = Calculator.analyzeAttractiveness(result);
    const textEl = document.getElementById('onAnalysisText');
    const box = document.getElementById('onAnalysis');
    const badge = document.getElementById('onAttrBadge');

    result.atractivo = analysis.nivel;

    box.className = 'analysis-box';
    if (analysis.nivel === 'ALTO') box.classList.add('success');
    else if (analysis.nivel === 'MEDIO') box.classList.add('warning');
    else box.classList.add('danger');

    // Días al vencimiento
    const onDiasEl = document.getElementById('onDias');
    if (onDiasEl) onDiasEl.textContent = result.dias + ' días';

    const TEM = result.TEM || 0;
    const difInflacion = result.difInflacion || 0;
    const difPF = result.difPF || 0;
    const difMP = result.difMP || 0;

    let text = `Instrumento de ${result.plazo || 'corto plazo'}. `;
    text += `TEM efectiva: ${Utils.formatPercent(TEM)}. `;
    text += `Rendimiento total del período: ${Utils.formatPercent(result.rendPeriodo)}. `;

    let supera = [];
    let noSupera = [];
    if (difMP > 0) supera.push('Mercado Pago');
    else noSupera.push('Mercado Pago');
    if (difPF > 0) supera.push('Plazo Fijo');
    else noSupera.push('Plazo Fijo');
    if (difInflacion > 0) supera.push('inflación');
    else noSupera.push('inflación');

    if (supera.length > 0) text += `Supera: ${supera.join(', ')}. `;
    if (noSupera.length > 0) text += `No supera: ${noSupera.join(', ')}. `;

    if (difInflacion > 0) {
      text += `Spread real positivo (${Utils.formatPercent(difInflacion)}): preserva poder adquisitivo.`;
    } else {
      text += `Spread real negativo (${Utils.formatPercent(difInflacion)}): pierde poder adquisitivo.`;
    }

    textEl.textContent = text;
    badge.textContent = analysis.nivel;
    badge.className = 'attr-badge ' + analysis.nivel.toLowerCase();
  },

  renderVentaBonoResults(result) {
    const r = document.getElementById('ventaBonoResults');
    r.style.display = 'block';

    const analysis = Calculator.analyzeVenta(result);
    const semaforo = analysis.semaforo;

    ['red', 'yellow', 'green'].forEach(c => {
      document.getElementById('vb' + c.charAt(0).toUpperCase() + c.slice(1)).className = 'light ' + c + (c === semaforo ? ' active' : '');
    });

    const isPos = (v) => v >= 0;
    const setVal = (id, val, className = '') => {
      const el = document.getElementById(id);
      el.textContent = val;
      el.className = 'result-value' + (className ? ' ' + className : '');
    };

    setVal('vbGanPerd', Utils.formatMoney(result.ganPerd), isPos(result.ganPerd) ? 'positive' : 'negative');
    setVal('vbNetoACobrar', Utils.formatMoney(result.totalNetoARetirar), isPos(result.totalNetoARetirar) ? 'positive' : 'negative');
    setVal('vbRendPct', Utils.formatPercent(result.rendPct), isPos(result.rendPct) ? 'positive' : 'negative');
    setVal('vbTNA', Utils.formatPercent(result.TNA));
    setVal('vbTEM', Utils.formatPercent(result.TEM));
    setVal('vbSpreadReal', Utils.formatPercent(result.difInflacion), isPos(result.difInflacion) ? 'positive' : 'negative');
    setVal('vbRendAnual', Utils.formatPercent(result.rendAnual));
    setVal('vbPrecioMin', Utils.formatMoney(result.precioMinimoVenta));

    const pf = document.getElementById('vbVsPF');
    pf.textContent = Utils.formatPercent(result.difPF);
    pf.className = 'comp-value ' + (result.difPF >= 0 ? 'positive' : 'negative');

    const mp = document.getElementById('vbVsMP');
    mp.textContent = Utils.formatPercent(result.difMP);
    mp.className = 'comp-value ' + (result.difMP >= 0 ? 'positive' : 'negative');

    const inf = document.getElementById('vbVsInflacion');
    inf.textContent = Utils.formatPercent(result.difInflacion);
    inf.className = 'comp-value ' + (result.difInflacion >= 0 ? 'positive' : 'negative');

    const textEl = document.getElementById('vbAnalysisText');
    const box = document.getElementById('vbAnalysis');

    box.className = 'analysis-box';
    if (semaforo === 'green') box.classList.add('success');
    else if (semaforo === 'yellow') box.classList.add('warning');
    else box.classList.add('danger');

    textEl.textContent = analysis.recomendacion;
  },

  renderVentaONResults(result) {
    const r = document.getElementById('ventaONResults');
    r.style.display = 'block';

    const analysis = Calculator.analyzeVenta(result);
    const semaforo = analysis.semaforo;

    ['red', 'yellow', 'green'].forEach(c => {
      document.getElementById('von' + c.charAt(0).toUpperCase() + c.slice(1)).className = 'light ' + c + (c === semaforo ? ' active' : '');
    });

    const isPos = (v) => v >= 0;
    const setVal = (id, val, className = '') => {
      const el = document.getElementById(id);
      el.textContent = val;
      el.className = 'result-value' + (className ? ' ' + className : '');
    };

    setVal('vonGanPerd', Utils.formatMoney(result.ganPerd), isPos(result.ganPerd) ? 'positive' : 'negative');
    setVal('vonNetoACobrar', Utils.formatMoney(result.totalNetoARetirar), isPos(result.totalNetoARetirar) ? 'positive' : 'negative');
    setVal('vonRendPct', Utils.formatPercent(result.rendPct), isPos(result.rendPct) ? 'positive' : 'negative');
    setVal('vonTNA', Utils.formatPercent(result.TNA));
    setVal('vonTEM', Utils.formatPercent(result.TEM));
    setVal('vonSpreadReal', Utils.formatPercent(result.difInflacion), isPos(result.difInflacion) ? 'positive' : 'negative');
    setVal('vonRendAnual', Utils.formatPercent(result.rendAnual));
    setVal('vonPrecioMin', Utils.formatMoney(result.precioMinimoVenta));

    const pf = document.getElementById('vonVsPF');
    pf.textContent = Utils.formatPercent(result.difPF);
    pf.className = 'comp-value ' + (result.difPF >= 0 ? 'positive' : 'negative');

    const mp = document.getElementById('vonVsMP');
    mp.textContent = Utils.formatPercent(result.difMP);
    mp.className = 'comp-value ' + (result.difMP >= 0 ? 'positive' : 'negative');

    const inf = document.getElementById('vonVsInflacion');
    inf.textContent = Utils.formatPercent(result.difInflacion);
    inf.className = 'comp-value ' + (result.difInflacion >= 0 ? 'positive' : 'negative');

    const textEl = document.getElementById('vonAnalysisText');
    const box = document.getElementById('vonAnalysis');

    box.className = 'analysis-box';
    if (semaforo === 'green') box.classList.add('success');
    else if (semaforo === 'yellow') box.classList.add('warning');
    else box.classList.add('danger');

    textEl.textContent = analysis.recomendacion;
  }
};
