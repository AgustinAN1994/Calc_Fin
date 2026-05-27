const Utils = {
  _currency: 'ARS',

  setCurrency(curr) {
    this._currency = curr;
  },

  getCurrency() {
    return this._currency;
  },

  currSymbol() {
    return this._currency === 'USD' ? 'US$' : '$';
  },

  formatMoney(n) {
    return this.currSymbol() + ' ' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatPercent(n) {
    return Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  },

  formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  daysBetween(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(0, Math.floor((e - s) / (1000 * 60 * 60 * 24)));
  },

  monthsBetween(start, end) {
    return Math.max(0.1, this.daysBetween(start, end) / 30.5);
  },

  yearsBetween(start, end) {
    return Math.max(0.01, this.daysBetween(start, end) / 365);
  },

  annualize(rate, days) {
    if (!days || days <= 0) return 0;
    const years = days / 365;
    return years > 0 ? (Math.pow(1 + rate / 100, 1 / years) - 1) * 100 : 0;
  },

  monthlyFromAnnual(annualRate) {
    return (Math.pow(1 + annualRate / 100, 1 / 12) - 1) * 100;
  },

  annualFromMonthly(monthlyRate) {
    return (Math.pow(1 + monthlyRate / 100, 12) - 1) * 100;
  },

  tnaToMonthly(tna) {
    return tna / 12;
  },

  effectiveMonthlyRate(periodReturnPct, days) {
    if (!days || days <= 0) return 0;
    return (Math.pow(1 + periodReturnPct / 100, 30 / days) - 1) * 100;
  },

  toId(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  },

  showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  getToday() {
    return new Date().toISOString().split('T')[0];
  },

  getDefaultDateFuture(years = 1) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().split('T')[0];
  }
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
