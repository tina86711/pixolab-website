const currentYear = new Date().getFullYear();
const copyrightYearElm = document.querySelector('footer.site-footer .js-copyright-year');

if (copyrightYearElm) {
  copyrightYearElm.innerHTML = copyrightYearElm.innerHTML.replace(/\d{4}/, currentYear);
}