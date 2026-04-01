const animeSections = document.querySelectorAll('.aos');

if ('IntersectionObserver' in window) { // Detect browser support "IntersectionObserver" or not

  // Detect elements is visible or not by Intersection Observer API
  var observer = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {

      if (entry.intersectionRatio > 0.01) {

        // If target is visible in the screen
        entry.target.classList.add('animated');

        if ( !document.documentElement.classList.contains('dev') ) {
          observer.unobserve(entry.target); // turn-off observer for this entry after fire once
        }

      }

      else if (
        entry.intersectionRatio < 0.01 &&
        document.documentElement.classList.contains('dev')
      ) {

        // If target is 'not' visible in the screen
        entry.target.classList.remove('animated');

      }

    });

  }, {
    rootMargin: '0px 0px -20%',
    threshold: [0, 0.01]
  });


  // Detect elements is visible or not by Intersection Observer API
  animeSections.forEach(function (animeSection) {
    observer.observe(animeSection);
  });

} else { // If browser not support 'IntersectionObserver' API, e.g. Safari before v12.1

  animeSections.forEach(function (animeSection) {
    animeSection.classList.add('animated'); // Add class '.animated' to all '.aos' (animate on page loaded)
  });

}