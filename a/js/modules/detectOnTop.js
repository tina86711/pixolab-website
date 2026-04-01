function detectOnTop () {
  const htmltag = document.documentElement;
  const header = document.querySelector('.site-header .wrapper');
  const sticky = document.querySelector('.aside-sticky');
  let webPageScrollPosition = window.scrollY || document.documentElement.scrollTop;
  let scrollTriggerPos = header.offsetHeight;

 if (webPageScrollPosition > scrollTriggerPos) {
   htmltag.classList.add('not-on-top');

   if (sticky) {
    sticky.classList.add('active');
  }
 } else {
   htmltag.classList.remove('not-on-top');

   if (sticky) {
    sticky.classList.remove('active');
  }
 }
}

window.addEventListener("load", function(){
 detectOnTop();
});

window.addEventListener("scroll", function(){
 detectOnTop();
});