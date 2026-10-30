(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var all = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var fmt = function (n) { return n.toLocaleString('uk-UA').replace(/ | /g, ' '); };

  /* ---------- pricing: tiers come from the .plan cards (data-qty / data-price) ---------- */
  var tiers = all('.plan[data-qty]').map(function (el) {
    var qty = parseInt(el.dataset.qty, 10);
    var price = parseInt(el.dataset.price, 10);
    return { qty: qty, price: price, unit: price / qty };
  }).sort(function (a, b) { return b.qty - a.qty; });

  function unitPrice(q) {
    for (var i = 0; i < tiers.length; i++) {
      if (q >= tiers[i].qty) { return tiers[i].unit; }
    }
    return tiers[tiers.length - 1].unit;
  }

  /* ---------- profit calculator ---------- */
  var qty = $('qty');
  var sell = $('sell');
  var presets = all('.preset');
  var els = {
    qty: $('qtyOut'), total: $('total'), per: $('per'),
    rev: $('rev'), profit: $('profit'), margin: $('margin')
  };

  function render() {
    var q = parseInt(qty.value, 10);
    var unit = unitPrice(q);
    var cost = Math.round(q * unit);
    var sp = parseInt(sell.value, 10);
    if (!isFinite(sp) || sp < 0) { sp = 0; }
    var revenue = q * sp;

    els.qty.textContent = fmt(q);
    els.total.textContent = fmt(cost) + ' грн';
    els.per.textContent = fmt(Math.round(unit)) + ' грн';
    els.rev.textContent = fmt(revenue) + ' грн';
    els.profit.textContent = fmt(revenue - cost);
    els.margin.textContent = sp > 0 ? '×' + (sp / unit).toFixed(1).replace('.', ',') : '—';

    qty.style.setProperty('--fill', ((q - qty.min) / (qty.max - qty.min) * 100) + '%');
    presets.forEach(function (b) {
      b.setAttribute('aria-pressed', String(parseInt(b.dataset.q, 10) === q));
    });
  }

  qty.addEventListener('input', render);
  sell.addEventListener('input', render);
  presets.forEach(function (b) {
    b.addEventListener('click', function () { qty.value = b.dataset.q; render(); });
  });
  render();

  /* ---------- copy-to-clipboard buttons ---------- */
  all('.copybtn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = $(btn.dataset.copy);
      if (!el) { return; }

      var done = function () {
        btn.textContent = 'Скопійовано';
        setTimeout(function () { btn.textContent = 'Скопіювати'; }, 1800);
      };
      var select = function () {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      };

      try {
        navigator.clipboard.writeText(el.textContent.trim()).then(done, select);
      } catch (err) {
        select();
      }
    });
  });

  /* ---------- sticky CTA ---------- */
  var sticky = $('sticky');
  window.addEventListener('scroll', function () {
    sticky.classList.toggle('on', window.scrollY > 700);
  }, { passive: true });
})();
