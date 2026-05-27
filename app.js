(function() {
  'use strict';

  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCurrency();
    ConfigManager.initForm();
    ConfigManager.bindForm();
    initNavigation();
    initSubNavigation();
    initSidebar();
    initCommissionSync();
    initRateModeToggles();
    initForms();
    initDateModeToggles();
    initTables();
    initExport();
    initExcelImport();
    initDataManagement();
    renderAllTables();
  });

  /* ===== THEME ===== */
  function initTheme() {
    const saved = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeBtn');
    const icon = btn.querySelector('.theme-icon');
    const label = btn.querySelector('.theme-label');
    if (saved === 'light') {
      icon.textContent = '☀️';
      label.textContent = 'Modo Claro';
    }
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      Storage.setTheme(next);
      if (next === 'light') {
        icon.textContent = '☀️';
        label.textContent = 'Modo Claro';
      } else {
        icon.textContent = '🌙';
        label.textContent = 'Modo Oscuro';
      }
    });
  }

  /* ===== CURRENCY TOGGLE ===== */
  function initCurrency() {
    const saved = Storage.get('currency', 'ARS');
    Utils.setCurrency(saved);

    document.querySelectorAll('.currency-toggle .curr-btn').forEach(btn => {
      if (btn.dataset.curr === saved) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    document.querySelectorAll('.curr-symbol').forEach(el => {
      el.textContent = Utils.currSymbol();
    });

    document.querySelectorAll('.currency-toggle .curr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.currency-toggle .curr-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const curr = btn.dataset.curr;
        Utils.setCurrency(curr);
        Storage.set('currency', curr);
        document.querySelectorAll('.curr-symbol').forEach(el => {
          el.textContent = Utils.currSymbol();
        });
        renderAllTables();
      });
    });
  }

  /* ===== SIDEBAR ===== */
  function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const main = document.getElementById('mainContent');

    const isMobile = () => window.innerWidth <= 768;

    // Restore collapsed state (desktop only)
    if (!isMobile()) {
      const saved = Storage.getSidebarCollapsed();
      if (saved) {
        sidebar.classList.add('collapsed');
        main.classList.add('sidebar-collapsed');
      }
    }

    toggle.addEventListener('click', () => {
      if (isMobile()) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
      } else {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('sidebar-collapsed');
        Storage.setSidebarCollapsed(sidebar.classList.contains('collapsed'));
      }
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });

    // Handle resize between mobile/desktop
    window.addEventListener('resize', () => {
      if (isMobile()) {
        sidebar.classList.remove('collapsed');
        main.classList.remove('sidebar-collapsed');
      } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        const saved = Storage.getSidebarCollapsed();
        if (saved) {
          sidebar.classList.add('collapsed');
          main.classList.add('sidebar-collapsed');
        } else {
          sidebar.classList.remove('collapsed');
          main.classList.remove('sidebar-collapsed');
        }
      }
    });
  }

  /* ===== COMMISSION SYNC ===== */
  function initCommissionSync() {
    const sync = () => {
      const cfg = ConfigManager.get();
      const fields = ['bonoComision', 'onComision', 'ventaBonoComision', 'ventaONComision'];
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = cfg.comision;
      });
    };

    sync();

    // Re-sync when config is saved
    const origSave = ConfigManager.save.bind(ConfigManager);
    ConfigManager.save = function(cfg) {
      origSave(cfg);
      const fields = ['bonoComision', 'onComision', 'ventaBonoComision', 'ventaONComision'];
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = cfg.comision;
      });
    };
  }

  /* ===== NAVIGATION ===== */
  function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        navigateTo(section);
        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
      });
    });
  }

  function navigateTo(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const targetSection = document.getElementById('section-' + section);
    if (targetSection) targetSection.classList.add('active');

    const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
    if (navItem) navItem.classList.add('active');
  }

  /* ===== SUB NAVIGATION ===== */
  function initSubNavigation() {
    document.querySelectorAll('.sub-nav').forEach(nav => {
      const btns = nav.querySelectorAll('.sub-nav-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          const parent = nav.parentElement;
          const subSections = parent.querySelectorAll('.sub-section');
          const target = btn.dataset.sub;

          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          subSections.forEach(s => s.classList.remove('active'));
          const targetSub = parent.querySelector('#sub-' + target);
          if (targetSub) targetSub.classList.add('active');
        });
      });
    });
  }

  /* ===== RATE MODE TOGGLE (TNA/TIR) ===== */
  function initRateModeToggles() {
    document.querySelectorAll('.rate-mode-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const target = toggle.dataset.target; // 'bono' or 'on'
        const hiddenInput = document.getElementById(target + 'TipoTasa');
        const badge = document.getElementById(target + 'RateType');
        const current = hiddenInput.value;
        const next = current === 'TNA' ? 'TIR' : 'TNA';
        hiddenInput.value = next;
        badge.textContent = next;
        toggle.textContent = next === 'TNA' ? 'TIR' : 'TNA';
      });
    });
  }

  /* ===== DATE MODE TOGGLE ===== */
  function initDateModeToggles() {
    document.querySelectorAll('.date-mode-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const target = toggle.dataset.target;
        const dateInput = document.getElementById(target + 'Fecha');
        const daysInput = document.getElementById(target + 'Dias');
        const isDateMode = dateInput.style.display !== 'none';

        if (isDateMode) {
          dateInput.style.display = 'none';
          dateInput.required = false;
          daysInput.style.display = 'block';
          daysInput.required = true;
          toggle.textContent = 'Usar fecha';
        } else {
          daysInput.style.display = 'none';
          daysInput.required = false;
          dateInput.style.display = 'block';
          dateInput.required = true;
          toggle.textContent = 'Usar días';
        }
      });
    });
  }

  function getFechaCompra(prefix) {
    const daysInput = document.getElementById(prefix + 'Dias');
    if (daysInput.style.display !== 'none' && daysInput.value) {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(daysInput.value));
      return d.toISOString().split('T')[0];
    }
    return document.getElementById(prefix + 'Fecha').value;
  }

  /* ===== FORMS ===== */
  function initForms() {
    // BONOS
    document.getElementById('formBonos').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        ticket: document.getElementById('bonoTicket').value,
        vto: document.getElementById('bonoVto').value,
        precio: parseFloat(document.getElementById('bonoPrecio').value) || 0,
        tasa: parseFloat(document.getElementById('bonoTasa').value) || 0,
        tipoTasa: document.getElementById('bonoTipoTasa').value,
        nominales: parseFloat(document.getElementById('bonoNominales').value) || 0,
        comision: parseFloat(document.getElementById('bonoComision').value) || ConfigManager.get().comision,
        currency: Utils.getCurrency()
      };
      const result = Calculator.calcBono(data);
      if (result.error) {
        Utils.showToast(result.error, 'error');
        return;
      }
      Analytics.renderBonoResults(result);
      Storage.addBono(result);
      renderBonoTable();
      Utils.showToast('Análisis completado', 'success');
    });

    document.getElementById('formBonos').addEventListener('reset', () => {
      document.getElementById('bonoResults').style.display = 'none';
    });

    // ON
    document.getElementById('formON').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        ticket: document.getElementById('onTicket').value,
        vto: document.getElementById('onVto').value,
        precio: parseFloat(document.getElementById('onPrecio').value) || 0,
        tasa: parseFloat(document.getElementById('onTasa').value) || 0,
        tipoTasa: document.getElementById('onTipoTasa').value,
        nominales: parseFloat(document.getElementById('onNominales').value) || 0,
        comision: parseFloat(document.getElementById('onComision').value) || ConfigManager.get().comision,
        currency: Utils.getCurrency()
      };
      const result = Calculator.calcON(data);
      if (result.error) {
        Utils.showToast(result.error, 'error');
        return;
      }
      Analytics.renderONResults(result);
      Storage.addON(result);
      renderONTable();
      Utils.showToast('Análisis completado', 'success');
    });

    document.getElementById('formON').addEventListener('reset', () => {
      document.getElementById('onResults').style.display = 'none';
    });

    // VENTA BONO
    document.getElementById('formVentaBono').addEventListener('submit', (e) => {
      e.preventDefault();
      const fechaCompra = getFechaCompra('ventaBono');
      if (!fechaCompra) {
        Utils.showToast('Ingresá fecha o días de tenencia', 'error');
        return;
      }
      const data = {
        ticket: document.getElementById('ventaBonoTicket').value,
        nominales: parseFloat(document.getElementById('ventaBonoNominales').value) || 0,
        precioCompra: parseFloat(document.getElementById('ventaBonoPCompra').value) || 0,
        fechaCompra: fechaCompra,
        precioActual: parseFloat(document.getElementById('ventaBonoPActual').value) || 0,
        comision: parseFloat(document.getElementById('ventaBonoComision').value) || ConfigManager.get().comision,
        currency: Utils.getCurrency()
      };
      const result = Calculator.calcVentaBono(data);
      if (result.error) {
        Utils.showToast(result.error, 'error');
        return;
      }
      const vbAnalysis = Calculator.analyzeVenta(result);
      result.semaforo = vbAnalysis.semaforo;
      Analytics.renderVentaBonoResults(result);
      Storage.addVentaBono(result);
      Utils.showToast('Análisis de venta completado', 'success');
    });

    document.getElementById('formVentaBono').addEventListener('reset', () => {
      document.getElementById('ventaBonoResults').style.display = 'none';
    });

    // VENTA ON
    document.getElementById('formVentaON').addEventListener('submit', (e) => {
      e.preventDefault();
      const fechaCompra = getFechaCompra('ventaON');
      if (!fechaCompra) {
        Utils.showToast('Ingresá fecha o días de tenencia', 'error');
        return;
      }
      const data = {
        ticket: document.getElementById('ventaONTicket').value,
        nominales: parseFloat(document.getElementById('ventaONNominales').value) || 0,
        precioCompra: parseFloat(document.getElementById('ventaONPCompra').value) || 0,
        fechaCompra: fechaCompra,
        precioActual: parseFloat(document.getElementById('ventaONPActual').value) || 0,
        comision: parseFloat(document.getElementById('ventaONComision').value) || ConfigManager.get().comision,
        currency: Utils.getCurrency()
      };
      const result = Calculator.calcVentaON(data);
      if (result.error) {
        Utils.showToast(result.error, 'error');
        return;
      }
      const vonAnalysis = Calculator.analyzeVenta(result);
      result.semaforo = vonAnalysis.semaforo;
      Analytics.renderVentaONResults(result);
      Storage.addVentaON(result);
      Utils.showToast('Análisis de venta completado', 'success');
    });

    document.getElementById('formVentaON').addEventListener('reset', () => {
      document.getElementById('ventaONResults').style.display = 'none';
    });
  }

  /* ===== TABLES ===== */
  function initTables() {
    document.getElementById('clearBonoHist').addEventListener('click', () => {
      Storage.saveBonos([]);
      renderBonoTable();
      Utils.showToast('Historial de bonos limpiado', 'info');
    });

    document.getElementById('clearONHist').addEventListener('click', () => {
      Storage.saveONs([]);
      renderONTable();
      Utils.showToast('Historial de ON limpiado', 'info');
    });

    document.getElementById('clearVentaBono').addEventListener('click', () => {
      Storage.saveVentaBonos([]);
      renderVentaBonoTable();
      Utils.showToast('Cartera de bonos limpiada', 'info');
    });

    document.getElementById('clearVentaON').addEventListener('click', () => {
      Storage.saveVentaONs([]);
      renderVentaONTable();
      Utils.showToast('Cartera de ON limpiada', 'info');
    });
  }

  function renderAllTables() {
    renderBonoTable();
    renderONTable();
    renderVentaBonoTable();
    renderVentaONTable();
  }

  function renderBonoTable() {
    const data = Storage.getBonos();
    const tbody = document.getElementById('bonoTableBody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">Sin análisis aún</td></tr>';
      return;
    }
    tbody.innerHTML = data.map((d, i) => {
      const attr = d.atractivo || (d.rendAnual > 20 ? 'ALTO' : d.rendAnual > 10 ? 'MEDIO' : 'BAJO');
      const badgeClass = attr === 'ALTO' ? 'alto' : attr === 'MEDIO' ? 'medio' : 'bajo';
      const tasaTxt = d.tasa !== undefined ? Utils.formatPercent(d.tasa) : (d.tir ? Utils.formatPercent(d.tir) : '—');
      return `<tr>
        <td><strong>${d.ticket}</strong></td>
        <td>${Utils.formatMoney(d.precio)}</td>
        <td>${tasaTxt}</td>
        <td>${Utils.formatPercent(d.rendAnual)}</td>
        <td><span class="attr-badge ${badgeClass}">${attr}</span></td>
        <td><button class="delete-btn" data-type="bono" data-index="${i}">✕</button></td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        Storage.removeBono(idx);
        renderBonoTable();
      });
    });
  }

  function renderONTable() {
    const data = Storage.getONs();
    const tbody = document.getElementById('onTableBody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">Sin análisis aún</td></tr>';
      return;
    }
    tbody.innerHTML = data.map((d, i) => {
      const attr = d.atractivo || (d.rendAnual > 20 ? 'ALTO' : d.rendAnual > 10 ? 'MEDIO' : 'BAJO');
      const badgeClass = attr === 'ALTO' ? 'alto' : attr === 'MEDIO' ? 'medio' : 'bajo';
      const tasaTxt = d.tasa !== undefined ? Utils.formatPercent(d.tasa) : (d.tir ? Utils.formatPercent(d.tir) : '—');
      return `<tr>
        <td><strong>${d.ticket}</strong></td>
        <td>${Utils.formatMoney(d.precio)}</td>
        <td>${tasaTxt}</td>
        <td>${Utils.formatPercent(d.rendAnual)}</td>
        <td><span class="attr-badge ${badgeClass}">${attr}</span></td>
        <td><button class="delete-btn" data-type="on" data-index="${i}">✕</button></td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        Storage.removeON(idx);
        renderONTable();
      });
    });
  }

  function renderVentaBonoTable() {
    const data = Storage.getVentaBonos();
    const tbody = document.getElementById('ventaBonoBody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">Sin tenencias cargadas</td></tr>';
      return;
    }
    tbody.innerHTML = data.map((d, i) => {
      const semaforo = d.semaforo || (d.rendPct >= 0 ? 'green' : 'red');
      const semColor = semaforo === 'green' ? 'var(--accent)' : semaforo === 'yellow' ? 'var(--warning)' : 'var(--danger)';
      const signo = d.ganPerd >= 0 ? '+' : '';
      return `<tr>
        <td><strong>${d.ticket}</strong></td>
        <td>${d.nominales.toLocaleString()}</td>
        <td>${Utils.formatMoney(d.precioCompra)}</td>
        <td>${Utils.formatMoney(d.precioActual)}</td>
        <td style="color:${d.ganPerd >= 0 ? 'var(--accent)' : 'var(--danger)'}">${signo}${Utils.formatMoney(d.ganPerd)}</td>
        <td style="color:${d.rendPct >= 0 ? 'var(--accent)' : 'var(--danger)'}">${Utils.formatPercent(d.rendPct)}</td>
        <td><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${semColor};"></span></td>
        <td><button class="delete-btn" data-type="ventaBono" data-index="${i}">✕</button></td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        Storage.removeVentaBono(idx);
        renderVentaBonoTable();
      });
    });
  }

  function renderVentaONTable() {
    const data = Storage.getVentaONs();
    const tbody = document.getElementById('ventaONBody');
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:2rem;">Sin tenencias cargadas</td></tr>';
      return;
    }
    tbody.innerHTML = data.map((d, i) => {
      const semaforo = d.semaforo || (d.rendPct >= 0 ? 'green' : 'red');
      const semColor = semaforo === 'green' ? 'var(--accent)' : semaforo === 'yellow' ? 'var(--warning)' : 'var(--danger)';
      const signo = d.ganPerd >= 0 ? '+' : '';
      return `<tr>
        <td><strong>${d.ticket}</strong></td>
        <td>${d.nominales.toLocaleString()}</td>
        <td>${Utils.formatMoney(d.precioCompra)}</td>
        <td>${Utils.formatMoney(d.precioActual)}</td>
        <td style="color:${d.ganPerd >= 0 ? 'var(--accent)' : 'var(--danger)'}">${signo}${Utils.formatMoney(d.ganPerd)}</td>
        <td style="color:${d.rendPct >= 0 ? 'var(--accent)' : 'var(--danger)'}">${Utils.formatPercent(d.rendPct)}</td>
        <td><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${semColor};"></span></td>
        <td><button class="delete-btn" data-type="ventaON" data-index="${i}">✕</button></td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        Storage.removeVentaON(idx);
        renderVentaONTable();
      });
    });
  }

  /* ===== EXPORT ===== */
  function initExport() {
    document.getElementById('exportVentaBonoPDF').addEventListener('click', ExportManager.exportVentaBonos);
    document.getElementById('exportVentaONPDF').addEventListener('click', ExportManager.exportVentaONs);

    document.getElementById('exportVentaBonoExcel').addEventListener('click', () => {
      ExportManager.toCSV(Storage.getVentaBonos(), 'cartera_bonos');
    });
    document.getElementById('exportVentaONExcel').addEventListener('click', () => {
      ExportManager.toCSV(Storage.getVentaONs(), 'cartera_on');
    });
  }

  /* ===== EXCEL IMPORT ===== */
  function initExcelImport() {
    function processExcel(file, tipo) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

          if (!json || json.length === 0) {
            Utils.showToast('El Excel está vacío', 'error');
            return;
          }

          let imported = 0;
          json.forEach(row => {
            const ticket = (row.Ticket || row.ticket || row.TICKET || '').toString().trim();
            const nominales = parseFloat(row.Nominales || row.nominales || row.NOMINALES || 0);
            const precioCompra = parseFloat(row.Precio || row.precio || row.PRECIO || row.PrecioCompra || row.precioCompra || 0);
            const precioActual = parseFloat(row.Actual || row.actual || row.ACTUAL || row.PrecioActual || row.precioActual || 0);
            const fechaCompra = row.Fecha || row.fecha || row.FECHA || row.FechaCompra || row.fechaCompra || '';

            if (!ticket || !nominales || !precioCompra) return;

            const calcData = {
              ticket, nominales, precioCompra, precioActual: precioActual || precioCompra,
              fechaCompra: fechaCompra || Utils.getDefaultDateFuture(-0.5),
              comision: ConfigManager.get().comision,
              currency: Utils.getCurrency()
            };

            let result;
            if (tipo === 'bono') {
              result = Calculator.calcVentaBono(calcData);
              if (!result.error) {
                result.semaforo = Calculator.analyzeVenta(result).semaforo;
                Storage.addVentaBono(result);
                imported++;
              }
            } else {
              result = Calculator.calcVentaON(calcData);
              if (!result.error) {
                result.semaforo = Calculator.analyzeVenta(result).semaforo;
                Storage.addVentaON(result);
                imported++;
              }
            }
          });

          if (tipo === 'bono') renderVentaBonoTable();
          else renderVentaONTable();

          Utils.showToast(`Importados ${imported} registros de ${json.length}`, imported > 0 ? 'success' : 'error');
        } catch (err) {
          Utils.showToast('Error al leer Excel: ' + err.message, 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    }

    document.getElementById('importVentaBonoExcel').addEventListener('click', () => {
      document.getElementById('importVentaBonoExcelInput').click();
    });

    document.getElementById('importVentaBonoExcelInput').addEventListener('change', (e) => {
      processExcel(e.target.files[0], 'bono');
      e.target.value = '';
    });

    document.getElementById('importVentaONExcel').addEventListener('click', () => {
      document.getElementById('importVentaONExcelInput').click();
    });

    document.getElementById('importVentaONExcelInput').addEventListener('change', (e) => {
      processExcel(e.target.files[0], 'on');
      e.target.value = '';
    });
  }

  /* ===== DATA MANAGEMENT ===== */
  function initDataManagement() {
    document.getElementById('exportData').addEventListener('click', () => {
      ExportManager.toJSON(Storage.exportAll(), 'finCalc_backup_' + new Date().toISOString().split('T')[0]);
    });

    document.getElementById('importData').addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });

    document.getElementById('importFileInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          Storage.importAll(data);
          renderAllTables();
          ConfigManager.initForm();
          initCurrency();
          Utils.showToast('Datos importados correctamente', 'success');
        } catch {
          Utils.showToast('Error al importar: formato inválido', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    document.getElementById('clearAllData').addEventListener('click', () => {
      if (confirm('¿Estás seguro de borrar todos los datos? Esta acción no se puede deshacer.')) {
        Storage.clearAll();
        renderAllTables();
        ConfigManager.initForm();
        Utils.showToast('Todos los datos fueron borrados', 'info');
      }
    });
  }

})();
