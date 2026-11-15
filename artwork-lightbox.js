/* Works detail — image lightbox */
(() => {
  const root = document.getElementById('work-detail');
  if (!root) return;

  const imageSelector = '.detail-main-image img, .cms-gallery-list img';
  const dialog = document.createElement('dialog');
  dialog.className = 'artwork-lightbox';
  dialog.setAttribute('aria-label', 'Artwork image viewer');

  const largeImage = document.createElement('img');
  largeImage.className = 'artwork-lightbox-image';
  largeImage.alt = '';

  function control(className, label, symbol) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `artwork-lightbox-control ${className}`;
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    return button;
  }

  const closeButton = control('artwork-lightbox-close', 'Close image', '×');
  const previousButton = control('artwork-lightbox-prev', 'Previous image', '‹');
  const nextButton = control('artwork-lightbox-next', 'Next image', '›');
  const count = document.createElement('span');
  count.className = 'artwork-lightbox-count';

  dialog.append(largeImage, closeButton, previousButton, nextButton, count);
  document.body.appendChild(dialog);

  let images = [];
  let current = 0;
  let opener = null;
  let previousOverflow = '';
  let touchStartX = null;

  function show(index) {
    if (!images.length) return;
    current = (index + images.length) % images.length;
    const selected = images[current];
    largeImage.src = selected.currentSrc || selected.src;
    largeImage.alt = selected.alt || 'Artwork image';
    count.textContent = `${current + 1} / ${images.length}`;
    previousButton.hidden = images.length < 2;
    nextButton.hidden = images.length < 2;
  }

  function open(image) {
    images = Array.from(root.querySelectorAll(imageSelector))
      .filter((img) => img.isConnected && img.getAttribute('src'));
    const index = images.indexOf(image);
    if (index === -1 || !image.complete || !image.naturalWidth) return;

    opener = image;
    show(index);
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  function enhanceImages() {
    root.querySelectorAll(imageSelector).forEach((image) => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `${image.alt || 'Artwork image'} — enlarge`);
    });
  }

  new MutationObserver(enhanceImages).observe(root, {
    childList: true,
    subtree: true
  });
  enhanceImages();

  root.addEventListener('click', (event) => {
    const image = event.target.closest(imageSelector);
    if (image) open(image);
  });

  root.addEventListener('keydown', (event) => {
    const image = event.target.closest(imageSelector);
    if (image && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      open(image);
    }
  });

  closeButton.addEventListener('click', () => dialog.close());
  previousButton.addEventListener('click', () => show(current - 1));
  nextButton.addEventListener('click', () => show(current + 1));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + 1);
    }
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.screenX ?? null;
  }, { passive: true });

  dialog.addEventListener('touchend', (event) => {
    if (touchStartX === null || images.length < 2) return;
    const difference = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(difference) > 50) show(current + (difference < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    largeImage.removeAttribute('src');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
})();
