const Calculator = {
  _config: null,

  _getConfig() {
    if (!this._config) this._config = ConfigManager.get();
    return this._config;
  },

  _getTasaComparativa(cfg, key, currency) {
    if (currency === 'USD') {
      const usdKey = key + 'USD';
      return cfg[usdKey] !== undefined ? cfg[usdKey] : 0;
    }
    return cfg[key] || 0;
  },

  /**
   * Calcula rendimiento de Bonos/Letras
   * @param {Object} data - { ticket, vto, precio, tasa, nominales, comision, tipoTasa, currency }
   *   tipoTasa: 'TNA' (simple) o 'TIR' (compuesta)
   *   precio: precio por cada 1 nominal
   *   tasa: TNA o TIR segun tipoTasa
   */
  calcBono(data) {
    const cfg = this._getConfig();
    const { ticket, vto, precio, tasa, nominales, comision, tipoTasa, currency } = data;
    const daysToVto = Utils.daysBetween(new Date(), new Date(vto));
    const monthsToVto = Utils.monthsBetween(new Date(), new Date(vto));
    const yearsToVto = Utils.yearsBetween(new Date(), new Date(vto));

    if (daysToVto <= 0) return { error: 'La fecha de vencimiento ya pasó' };

    // Precio por cada 1 nominal → inversion = nominales × precio
    const inversion = nominales * precio;
    const comisionEntrada = inversion * (comision / 100);
    const inversionTotal = inversion + comisionEntrada;

    // Cálculo del valor final según tipo de tasa
    let factor, valorFinal;
    if (tipoTasa === 'TNA') {
      factor = (tasa / 100) * (daysToVto / 365);
      valorFinal = inversion * (1 + factor);
    } else {
      factor = Math.pow(1 + tasa / 100, daysToVto / 365) - 1;
      valorFinal = inversion * (1 + factor);
    }

    const gananciaNominal = valorFinal - inversionTotal;
    const rendPeriodo = (valorFinal / inversion - 1) * 100;

    // Tasas anualizadas (display)
    let rendAnual, rendMensual;
    if (tipoTasa === 'TNA') {
      rendAnual = tasa;
      rendMensual = tasa / 12;
    } else {
      rendAnual = tasa;
      rendMensual = (Math.pow(1 + tasa / 100, 1 / 12) - 1) * 100;
    }

    // TEM efectiva desde el rendimiento real del período
    const TEM = Utils.effectiveMonthlyRate(rendPeriodo, daysToVto);

    // Comparaciones mensuales (todo en base mensual)
    const c = currency || 'ARS';
    const inflMensual = this._getTasaComparativa(cfg, 'inflacionMensual', c);
    const tasaPFAnual = this._getTasaComparativa(cfg, 'tasaPlazoFijo', c);
    const tasaMPAnual = this._getTasaComparativa(cfg, 'tasaMercadoPago', c);
    // PF y MP se expresan como TNA → tasa mensual simple = TNA/12
    const TEM_PF = tasaPFAnual / 12;
    const TEM_MP = tasaMPAnual / 12;

    const inflacionPeriodo = Math.pow(1 + inflMensual / 100, monthsToVto) - 1;
    const gananciaReal = gananciaNominal - (inversion * inflacionPeriodo);

    // Spread mensual real = TEM - inflación mensual
    const difInflacion = TEM - inflMensual;
    const difPF = TEM - TEM_PF;
    const difMP = TEM - TEM_MP;

    // Comisión aplicada también a la salida (venta al vencimiento)
    const comisionSalida = valorFinal * (comision / 100);
    const totalBrutoARetirar = valorFinal;
    const totalNetoARetirar = valorFinal - comisionSalida;
    const gananciaNetaFinal = totalNetoARetirar - inversionTotal;
    const rendPeriodoNeto = inversionTotal > 0 ? (totalNetoARetirar / inversionTotal - 1) * 100 : 0;

    // Plazo interpretación
    const plazo = daysToVto < 30 ? 'muy corto plazo' : daysToVto <= 90 ? 'corto plazo' : 'mediano plazo';

    return {
      ticket: Utils.toId(ticket),
      vto,
      precio,
      tasa,
      tipoTasa,
      currency: c,
      nominales,
      inversion,
      inversionTotal,
      comisionEntrada,
      comisionSalida,
      comision,
      valorFinal,
      totalBrutoARetirar,
      totalNetoARetirar,
      gananciaNominal,
      gananciaNetaFinal,
      gananciaReal,
      rendPeriodo,
      rendPeriodoNeto,
      rendMensual,
      rendAnual,
      TEM,
      difInflacion,
      difPF,
      difMP,
      inflacionPeriodo: inflacionPeriodo * 100,
      plazo,
      meses: monthsToVto,
      dias: daysToVto,
      years: yearsToVto
    };
  },

  /**
   * Calcula rendimiento de Obligaciones Negociables
   */
  calcON(data) {
    const cfg = this._getConfig();
    const { ticket, vto, precio, tasa, nominales, comision, tipoTasa, currency } = data;
    const monthsToVto = Utils.monthsBetween(new Date(), new Date(vto));
    const yearsToVto = Utils.yearsBetween(new Date(), new Date(vto));
    const daysToVto = Utils.daysBetween(new Date(), new Date(vto));

    if (daysToVto <= 0) return { error: 'La fecha de vencimiento ya pasó' };

    const inversion = nominales * precio;
    const comisionEntrada = inversion * (comision / 100);
    const inversionTotal = inversion + comisionEntrada;

    let factor, valorFinal;
    if (tipoTasa === 'TNA') {
      factor = (tasa / 100) * (daysToVto / 365);
      valorFinal = inversion * (1 + factor);
    } else {
      factor = Math.pow(1 + tasa / 100, daysToVto / 365) - 1;
      valorFinal = inversion * (1 + factor);
    }

    const gananciaNominal = valorFinal - inversionTotal;
    const rendPeriodo = (valorFinal / inversion - 1) * 100;

    let rendAnual, rendMensual;
    if (tipoTasa === 'TNA') {
      rendAnual = tasa;
      rendMensual = tasa / 12;
    } else {
      rendAnual = tasa;
      rendMensual = (Math.pow(1 + tasa / 100, 1 / 12) - 1) * 100;
    }

    const TEM = Utils.effectiveMonthlyRate(rendPeriodo, daysToVto);

    const c = currency || 'ARS';
    const inflMensual = this._getTasaComparativa(cfg, 'inflacionMensual', c);
    const tasaPFAnual = this._getTasaComparativa(cfg, 'tasaPlazoFijo', c);
    const tasaMPAnual = this._getTasaComparativa(cfg, 'tasaMercadoPago', c);
    const TEM_PF = tasaPFAnual / 12;
    const TEM_MP = tasaMPAnual / 12;

    const inflacionPeriodo = Math.pow(1 + inflMensual / 100, monthsToVto) - 1;
    const difInflacion = TEM - inflMensual;
    const difPF = TEM - TEM_PF;
    const difMP = TEM - TEM_MP;

    const comisionSalida = valorFinal * (comision / 100);
    const totalBrutoARetirar = valorFinal;
    const totalNetoARetirar = valorFinal - comisionSalida;
    const gananciaNetaFinal = totalNetoARetirar - inversionTotal;
    const rendPeriodoNeto = inversionTotal > 0 ? (totalNetoARetirar / inversionTotal - 1) * 100 : 0;

    const plazo = daysToVto < 30 ? 'muy corto plazo' : daysToVto <= 90 ? 'corto plazo' : 'mediano plazo';

    return {
      ticket: Utils.toId(ticket),
      vto,
      precio,
      tasa,
      tipoTasa,
      currency: c,
      nominales,
      inversion,
      inversionTotal,
      comisionEntrada,
      comisionSalida,
      comision,
      valorFinal,
      totalBrutoARetirar,
      totalNetoARetirar,
      gananciaNominal,
      gananciaNetaFinal,
      rendPeriodo,
      rendPeriodoNeto,
      rendMensual,
      rendAnual,
      TEM,
      difInflacion,
      difPF,
      difMP,
      plazo,
      meses: monthsToVto,
      dias: daysToVto
    };
  },

  calcVentaBono(data) {
    const cfg = this._getConfig();
    const { ticket, nominales, precioCompra, fechaCompra, precioActual, comision, currency } = data;

    const diasTranscurridos = Utils.daysBetween(new Date(fechaCompra), new Date());
    const mesesTranscurridos = Utils.monthsBetween(new Date(fechaCompra), new Date());
    const yearsTranscurridos = Utils.yearsBetween(new Date(fechaCompra), new Date());

    if (diasTranscurridos <= 0) return { error: 'La fecha de compra debe ser anterior a hoy' };

    // Precio por 1 nominal
    const inversion = nominales * precioCompra;
    const valorActual = nominales * precioActual;

    const comisionEntrada = inversion * (comision / 100);
    const comisionVenta = valorActual * (comision / 100);

    const totalBrutoARetirar = valorActual;
    const totalNetoARetirar = valorActual - comisionVenta;

    const ganPerd = valorActual - inversion;
    // Ganancia neta: solo descuenta comisión de salida (la de entrada es costo hundido)
    const gananciaNetaFinal = totalNetoARetirar - inversion;
    // Rendimiento bruto del período (matching Balanz, sin descontar comisión)
    const rendPct = inversion > 0 ? (ganPerd / inversion) * 100 : 0;
    // Rendimiento neto descontando solo comisión de salida
    const rendPctNeto = inversion > 0 ? ((totalNetoARetirar / inversion) - 1) * 100 : 0;
    const TNA = diasTranscurridos > 0 ? (rendPct / diasTranscurridos) * 365 : 0;
    const TEM = Utils.effectiveMonthlyRate(rendPct, diasTranscurridos);
    const rendAnual = yearsTranscurridos > 0 ? (Math.pow(1 + rendPct / 100, 1 / yearsTranscurridos) - 1) * 100 : 0;

    const c = currency || 'ARS';
    const inflMensual = this._getTasaComparativa(cfg, 'inflacionMensual', c);
    const tasaPFAnual = this._getTasaComparativa(cfg, 'tasaPlazoFijo', c);
    const tasaMPAnual = this._getTasaComparativa(cfg, 'tasaMercadoPago', c);
    const TEM_PF = tasaPFAnual / 12;
    const TEM_MP = tasaMPAnual / 12;

    const inflacionPeriodo = Math.pow(1 + inflMensual / 100, mesesTranscurridos) - 1;
    const difInflacion = TEM - inflMensual;
    const difPF = TEM - TEM_PF;
    const difMP = TEM - TEM_MP;

    // Precio mínimo para no perder (solo comisión de salida; la de entrada es hundida)
    const precioMinimoVenta = precioCompra / (1 - comision / 100);

    return {
      ticket: Utils.toId(ticket),
      nominales,
      precioCompra,
      precioActual,
      currency: c,
      inversion,
      inversionTotal: inversion,
      valorActual,
      ganPerd,
      gananciaNetaFinal,
      rendPct,
      rendPctNeto,
      TNA,
      TEM,
      rendAnual,
      totalBrutoARetirar,
      totalNetoARetirar,
      difInflacion,
      difPF,
      difMP,
      precioMinimoVenta,
      comisionEntrada,
      comisionSalida: comisionVenta,
      comision,
      dias: diasTranscurridos,
      meses: mesesTranscurridos
    };
  },

  calcVentaON(data) {
    return this.calcVentaBono(data);
  },

  analyzeAttractiveness(result) {
    let score = 0;
    let reasons = [];
    let nivel = 'BAJO';

    const TEM = result.TEM || 0;
    const difInflacion = result.difInflacion || 0;
    const difPF = result.difPF || 0;
    const difMP = result.difMP || 0;
    const dias = result.dias || 0;

    // Spread real vs inflación (peso principal)
    if (difInflacion > 1) {
      score += 3;
      reasons.push('Spread real mensual supera 1%: gana holgadamente a la inflación');
    } else if (difInflacion > 0.5) {
      score += 2;
      reasons.push('Spread real positivo: preserva poder adquisitivo');
    } else if (difInflacion > 0) {
      score += 1;
      reasons.push('TEM apenas superior a inflación');
    } else {
      score -= 2;
      reasons.push('TEM menor a inflación mensual: pérdida de poder adquisitivo');
    }

    // vs Plazo Fijo (peso medio)
    if (difPF > 0) {
      score += 2;
      reasons.push('TEM superior al rendimiento mensual del PF');
    } else {
      score -= 1;
      reasons.push('TEM menor o igual al rendimiento mensual del PF');
    }

    // vs Mercado Pago (peso medio)
    if (difMP > 0) {
      score += 2;
      reasons.push('TEM superior al rendimiento mensual de MP');
    } else {
      score -= 1;
      reasons.push('TEM menor o igual al rendimiento mensual de MP');
    }

    // Ajuste por plazo: instrumentos muy cortos tienen menos riesgo
    if (dias > 0 && dias < 30) score += 1;

    if (score >= 6) nivel = 'ALTO';
    else if (score >= 2) nivel = 'MEDIO';
    else nivel = 'BAJO';

    return { score, nivel, reasons };
  },

  analyzeVenta(result) {
    const cfg = this._getConfig();
    const c = result.currency || 'ARS';
    const inflMensual = this._getTasaComparativa(cfg, 'inflacionMensual', c);
    const tasaPFAnual = this._getTasaComparativa(cfg, 'tasaPlazoFijo', c);
    const tasaMPAnual = this._getTasaComparativa(cfg, 'tasaMercadoPago', c);
    const TEM_PF = tasaPFAnual / 12;
    const TEM_MP = tasaMPAnual / 12;

    const TEM = result.TEM || 0;
    const spreadReal = result.difInflacion || 0;

    const superaInflacion = spreadReal > 0;
    const superaPF = TEM > TEM_PF;
    const superaMP = TEM > TEM_MP;

    let score = 0;
    let recomendacion = '';
    let semaforo = 'red';

    if (superaInflacion && superaPF && superaMP) {
      semaforo = 'green';
      score = 6;
      recomendacion = 'Ganancia real positiva. El instrumento está batiendo a la inflación y a las tasas de referencia de mercado. Se recomienda mantener hasta el vencimiento.';
    } else if (!superaInflacion && (superaPF || superaMP)) {
      semaforo = 'yellow';
      score = 1;
      recomendacion = 'El instrumento no llega a cubrir la inflación mensual (Spread Real negativo), pero rinde más que un Plazo Fijo o Mercado Pago en este período. Si buscás tasa real positiva, evalúa rotar hacia activos de mayor cobertura.';
    } else {
      semaforo = 'red';
      score = -3;
      recomendacion = 'Alerta de ineficiencia. El instrumento pierde contra la inflación y rinde menos que las alternativas de liquidez inmediata (Plazo Fijo / Billeteras virtuales). Conviene vender y reubicar el capital.';
    }

    return { score, recomendacion, semaforo };
  }
};
