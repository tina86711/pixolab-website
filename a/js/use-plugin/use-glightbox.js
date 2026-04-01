document.addEventListener('DOMContentLoaded', function () {
  const lightbox = GLightbox({
    selector: '.signup',
    loop: false,
    closeButton: true,
    draggable: false,
    touchNavigation: false,
    keyboardNavigation: false,
    width: '900px',
    openEffect: 'fade',
    closeEffect: 'fade',
  });
});