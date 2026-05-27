const ConfigManager = {
  _config: null,

  load() {
    this._config = Storage.getConfig();
    return this._config;
  },

  get() {
    if (!this._config) this.load();
    return this._config;
  },

  save(cfg) {
    this._config = { ...this._config, ...cfg };
    Storage.saveConfig(this._config);
    return this._config;
  },

  initForm() {
    const cfg = this.load();
    document.getElementById('cfgInflacion').value = cfg.inflacionMensual;
    document.getElementById('cfgPlazoFijo').value = cfg.tasaPlazoFijo;
    document.getElementById('cfgMercadoPago').value = cfg.tasaMercadoPago;
    document.getElementById('cfgInflacionUSD').value = cfg.inflacionMensualUSD;
    document.getElementById('cfgPlazoFijoUSD').value = cfg.tasaPlazoFijoUSD;
    document.getElementById('cfgMercadoPagoUSD').value = cfg.tasaMercadoPagoUSD;
    document.getElementById('cfgComision').value = cfg.comision;
    document.getElementById('cfgTNA').value = cfg.tnaReferencia;
    document.getElementById('cfgTEM').value = cfg.temReferencia;
  },

  bindForm() {
    const form = document.getElementById('configForm');
    const savedMsg = document.getElementById('configSavedMsg');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cfg = {
        inflacionMensual: parseFloat(document.getElementById('cfgInflacion').value) || 0,
        tasaPlazoFijo: parseFloat(document.getElementById('cfgPlazoFijo').value) || 0,
        tasaMercadoPago: parseFloat(document.getElementById('cfgMercadoPago').value) || 0,
        inflacionMensualUSD: parseFloat(document.getElementById('cfgInflacionUSD').value) || 0,
        tasaPlazoFijoUSD: parseFloat(document.getElementById('cfgPlazoFijoUSD').value) || 0,
        tasaMercadoPagoUSD: parseFloat(document.getElementById('cfgMercadoPagoUSD').value) || 0,
        comision: parseFloat(document.getElementById('cfgComision').value) || 0,
        tnaReferencia: parseFloat(document.getElementById('cfgTNA').value) || 0,
        temReferencia: parseFloat(document.getElementById('cfgTEM').value) || 0
      };
      this.save(cfg);
      savedMsg.style.display = 'block';
      setTimeout(() => { savedMsg.style.display = 'none'; }, 3000);
      Utils.showToast('Configuración guardada', 'success');
    });

    document.getElementById('cfgReset').addEventListener('click', () => {
      this.save({
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
      this.initForm();
      Utils.showToast('Configuración restablecida', 'info');
    });
  }
};
