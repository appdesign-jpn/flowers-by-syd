// Flowers by Syd — site behavior

var ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/28211576/4ual770/';

function sendToZapier(formData) {
  var payload = {};
  formData.forEach(function (value, key) { payload[key] = value; });
  return fetch(ZAPIER_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close menu when a link is tapped
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Gallery: fetch from content/gallery.json and render, then wire up filtering
  var galleryGrid = document.getElementById('galleryGrid');
  var filterButtons = document.querySelectorAll('.filter-btn');
  if (galleryGrid) {
    fetch('content/gallery.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = (data && data.items) || [];
        if (!items.length) {
          galleryGrid.innerHTML = '<p class="gallery-loading">No photos yet — check back soon.</p>';
          return;
        }
        var catLabels = { bouquets: 'Bouquets', weddings: 'Weddings', events: 'Events' };
        galleryGrid.innerHTML = items.map(function (item) {
          var cat = item.category || 'bouquets';
          var label = catLabels[cat] || cat;
          var alt = (item.alt || item.caption || '').replace(/"/g, '&quot;');
          var caption = item.caption || '';
          return '' +
            '<div class="gallery-item" data-cat="' + cat + '">' +
              '<div class="gallery-photo ' + cat + '">' +
                '<img src="' + item.image + '" alt="' + alt + '" style="width:100%;height:100%;object-fit:cover;">' +
              '</div>' +
              '<div class="gallery-caption">' +
                '<span class="cat">' + label + '</span>' +
                '<h3>' + caption + '</h3>' +
              '</div>' +
            '</div>';
        }).join('');

        var galleryItems = galleryGrid.querySelectorAll('.gallery-item');
        if (filterButtons.length && galleryItems.length) {
          filterButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
              filterButtons.forEach(function (b) { b.classList.remove('active'); });
              btn.classList.add('active');
              var filter = btn.getAttribute('data-filter');
              galleryItems.forEach(function (item) {
                var show = filter === 'all' || item.getAttribute('data-cat') === filter;
                item.style.display = show ? '' : 'none';
              });
            });
          });
        }
      })
      .catch(function () {
        galleryGrid.innerHTML = '<p class="gallery-loading">Couldn\'t load the gallery right now — please refresh.</p>';
      });
  }

  // Order form submit — posts to Formspree (see contact.html form action)
  var orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = document.getElementById('formFields');
      var success = document.getElementById('formSuccess');
      var error = document.getElementById('formError');
      var submitBtn = orderForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

      var formData = new FormData(orderForm);

      Promise.allSettled([
        fetch(orderForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }),
        sendToZapier(formData)
      ]).then(function (results) {
        var formspreeResult = results[0];
        var formspreeOk = formspreeResult.status === 'fulfilled' && formspreeResult.value.ok;

        if (formspreeOk) {
          if (fields && success) {
            fields.style.display = 'none';
            success.classList.add('show');
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                success.classList.add('animate-in');
              });
            });
          }
        } else {
          if (error) { error.classList.add('show'); }
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send My Order'; }
        }
      });
    });
  }

});
