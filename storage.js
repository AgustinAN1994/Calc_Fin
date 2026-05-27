const Storage = {
  _prefix: 'finCalc_',

  _key(key) {
    return this._prefix + key;
  },

  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(this._key(key));
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(this._key(key));
  },

  getConfig() {
    return this.get('config', {
      inflacionMensual: 3.5,
      tasaPlazoFijo: 35,
      tasaMercadoPago: 40,
      inflacionMensualUSD: 0.25,
      tasaPlazoFijoUSD: 1.5,
      tasaMercadoPagoUSD: 0,
      comision: 0.25,
      tnaReferencia: 50,
      temReferencia: 3.8
    });
  },

  saveConfig(cfg) {
    return this.set('config', cfg);
  },

  getBonos() {
    return this.get('bonos', []);
  },

  saveBonos(data) {
    return this.set('bonos', data);
  },

  addBono(item) {
    const list = this.getBonos();
    list.unshift(item);
    this.saveBonos(list);
    return list;
  },

  removeBono(index) {
    const list = this.getBonos();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      this.saveBonos(list);
    }
    return list;
  },

  getONs() {
    return this.get('ons', []);
  },

  saveONs(data) {
    return this.set('ons', data);
  },

  addON(item) {
    const list = this.getONs();
    list.unshift(item);
    this.saveONs(list);
    return list;
  },

  removeON(index) {
    const list = this.getONs();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      this.saveONs(list);
    }
    return list;
  },

  getVentaBonos() {
    return this.get('ventaBonos', []);
  },

  saveVentaBonos(data) {
    return this.set('ventaBonos', data);
  },

  addVentaBono(item) {
    const list = this.getVentaBonos();
    list.unshift(item);
    this.saveVentaBonos(list);
    return list;
  },

  removeVentaBono(index) {
    const list = this.getVentaBonos();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      this.saveVentaBonos(list);
    }
    return list;
  },

  getVentaONs() {
    return this.get('ventaONs', []);
  },

  saveVentaONs(data) {
    return this.set('ventaONs', data);
  },

  addVentaON(item) {
    const list = this.getVentaONs();
    list.unshift(item);
    this.saveVentaONs(list);
    return list;
  },

  removeVentaON(index) {
    const list = this.getVentaONs();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      this.saveVentaONs(list);
    }
    return list;
  },

  getTheme() {
    return this.get('theme', 'dark');
  },

  setTheme(t) {
    return this.set('theme', t);
  },

  getSidebarCollapsed() {
    return this.get('sidebarCollapsed', false);
  },

  setSidebarCollapsed(v) {
    return this.set('sidebarCollapsed', !!v);
  },

  exportAll() {
    const cfg = this.getConfig();
    return {
      config: cfg,
      bonos: this.getBonos(),
      ons: this.getONs(),
      ventaBonos: this.getVentaBonos(),
      ventaONs: this.getVentaONs(),
      theme: this.getTheme(),
      currency: this.get('currency', 'ARS'),
      sidebarCollapsed: this.getSidebarCollapsed(),
      exportedAt: new Date().toISOString()
    };
  },

  importAll(data) {
    if (data.config) this.saveConfig(data.config);
    if (data.bonos) this.saveBonos(data.bonos);
    if (data.ons) this.saveONs(data.ons);
    if (data.ventaBonos) this.saveVentaBonos(data.ventaBonos);
    if (data.ventaONs) this.saveVentaONs(data.ventaONs);
    if (data.theme) this.setTheme(data.theme);
    if (data.currency) this.set('currency', data.currency);
  },

  clearAll() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this._prefix));
    keys.forEach(k => localStorage.removeItem(k));
  }
};
