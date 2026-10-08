(() => {
  const $ = (id) => document.getElementById(id);
  const nf = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 });
  const n1 = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const monthlyShare = [.035, .045, .075, .095, .11, .12, .125, .105, .09, .075, .065, .06];
  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const usage = $('usage'), usageRange = $('usage-range');
  const modules = $('modules'), modulesRange = $('modules-range');

  function setPair(input, range, value) {
    const min = Number(input.min), max = Number(input.max);
    const next = Math.max(min, Math.min(max, Math.round(Number(value) || min)));
    input.value = String(next);
    range.value = String(next);
  }

  function renderChart(production) {
    const chart = $('monthly-chart');
    chart.replaceChildren();
    const peak = Math.max(...monthlyShare);
    monthlyShare.forEach((share, index) => {
      const value = production * share;
      const column = document.createElement('div');
      column.className = 'month';
      const bar = document.createElement('span');
      bar.className = 'month-bar';
      bar.style.height = `${Math.max(2, value / (production * peak) * 100)}%`;
      bar.title = `${monthNames[index]}: ${nf.format(value)} kWh`;
      const label = document.createElement('span');
      label.className = 'month-label';
      label.textContent = monthNames[index];
      column.append(bar, label);
      chart.append(column);
    });
  }

  function renderRoof(count) {
    const roof = $('roof-plan');
    roof.replaceChildren();
    for (let i = 0; i < 40; i++) {
      const tile = document.createElement('span');
      tile.className = i < count ? 'roof-module' : 'roof-module empty';
      roof.append(tile);
    }
  }

  function update() {
    const annualUsage = Number(usage.value);
    const count = Number(modules.value);
    if (!Number.isFinite(annualUsage) || !Number.isFinite(count)) return;

    const kwp = count * .43;
    const production = kwp * 1000;
    const selfUse = Math.min(annualUsage, production * .35);
    const exportEnergy = Math.max(0, production - selfUse);
    const grid = Math.max(0, annualUsage - selfUse);
    const selfRatio = production ? selfUse / production : 0;
    const autarky = annualUsage ? selfUse / annualUsage : 0;
    const investment = count * 850 + 4000;
    const annualBenefit = selfUse * .30 + exportEnergy * .08 - 180;
    const payback = annualBenefit > 0 ? investment / annualBenefit : null;
    const money = value => `CHF ${nf.format(value)}`;

    $('annual-production').innerHTML = `${nf.format(production)} <small>kWh/Jahr</small>`;
    $('system-size').textContent = `${n1.format(kwp)} kWp · ${nf.format(count)} Module`;
    $('self-use').textContent = `${nf.format(selfUse)} kWh`;
    $('self-share').textContent = `${nf.format(selfRatio * 100)} % der Produktion`;
    $('autarky').textContent = `${nf.format(autarky * 100)} %`;
    $('benefit').textContent = money(annualBenefit);
    $('payback').textContent = payback ? `${n1.format(payback)} Jahre` : 'Nicht erreicht';
    $('solar-total').textContent = `${nf.format(production)} kWh`;
    $('flow-self').textContent = `${nf.format(selfUse)} kWh`;
    $('flow-export').textContent = `${nf.format(exportEnergy)} kWh`;
    $('demand-total').textContent = `${nf.format(annualUsage)} kWh`;
    $('demand-self').textContent = `${nf.format(selfUse)} kWh`;
    $('grid-use').textContent = `${nf.format(grid)} kWh`;
    $('solar-self-bar').style.width = `${selfRatio * 100}%`;
    $('solar-export-bar').style.width = `${(1 - selfRatio) * 100}%`;
    $('demand-covered-bar').style.width = `${autarky * 100}%`;
    $('demand-grid-bar').style.width = `${(1 - autarky) * 100}%`;
    $('roof-module-count').textContent = `${nf.format(count)} Module`;
    $('table-kwp').textContent = `${n1.format(kwp)} kWp`;
    $('investment').textContent = money(investment);
    $('table-grid').textContent = `${nf.format(grid)} kWh/Jahr`;
    $('table-export').textContent = `${nf.format(exportEnergy)} kWh/Jahr`;
    renderChart(production);
    renderRoof(count);
  }

  usage.addEventListener('input', () => {
    const value = Number(usage.value);
    if (usage.value !== '' && value >= Number(usage.min) && value <= Number(usage.max)) { usageRange.value = String(value); update(); }
  });
  usage.addEventListener('change', () => { setPair(usage, usageRange, usage.value); update(); });
  usageRange.addEventListener('input', () => { setPair(usage, usageRange, usageRange.value); update(); });
  modules.addEventListener('input', () => {
    const value = Number(modules.value);
    if (modules.value !== '' && value >= Number(modules.min) && value <= Number(modules.max)) { modulesRange.value = String(value); update(); }
  });
  modules.addEventListener('change', () => { setPair(modules, modulesRange, modules.value); update(); });
  modulesRange.addEventListener('input', () => { setPair(modules, modulesRange, modulesRange.value); update(); });
  $('reset-values').addEventListener('click', () => {
    setPair(usage, usageRange, 4500);
    setPair(modules, modulesRange, 24);
    update();
  });
  $('print-report').addEventListener('click', () => window.print());
  setPair(usage, usageRange, usage.value);
  setPair(modules, modulesRange, modules.value);
  update();
})();
