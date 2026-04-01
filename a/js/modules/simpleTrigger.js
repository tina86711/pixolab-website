function simpleTriggerByType(e, that) {
  e.preventDefault();

  let clickedTriggerValue = that.getAttribute('data-jq-switcher-trigger');
  let groupValue = that.getAttribute('data-jq-switcher-group');

  let elms_trigger = document.querySelectorAll('[data-jq-switcher-trigger="' + clickedTriggerValue + '"]');
  let elms_target = document.querySelectorAll('[data-jq-switcher-target="' + clickedTriggerValue + '"]');
  let elms_group = document.querySelectorAll('[data-jq-switcher-group="' + groupValue + '"]');

  // Type-1: Self Trigger ON/OFF
  if (
    that.hasAttribute('data-jq-switcher-target') &&
    !elms_group.length
  ) {
    that.classList.toggle('active');
  }

  // Type-2: Tabs/Accordion
  if ( elms_group.length ) {
    elms_group.forEach(group => {
      group.classList.remove('active');
    });

    elms_trigger.forEach(trigger => {
      trigger.classList.toggle('active');
    });

    elms_target.forEach(target => {
      target.classList.toggle('active');
    });

  }

  // Type-3: FAQ Box
  if (
    !that.hasAttribute('data-jq-switcher-target') &&
    !elms_group.length
  ) {
    if ( that.classList.contains('active') ) {
      elms_trigger[0].classList.remove('active');
      elms_target[0].classList.remove("active");
    } else {
      elms_trigger[0].classList.add('active');
      elms_target[0].classList.add("active");
    }

  }
}

window.addEventListener("load", function() {
  const targetElmsByClick = document.querySelectorAll(":not(.js-switch-by-hover) [data-jq-switcher-trigger]");
  targetElmsByClick.forEach(targetElm => {
    targetElm.addEventListener('click', e => {
      simpleTriggerByType(e, e.currentTarget);
    })
  });

  const targetElmsByMouseenter = document.querySelectorAll(".js-switch-by-hover [data-jq-switcher-trigger]");
  targetElmsByMouseenter.forEach(targetElm => {
    targetElm.addEventListener('mouseenter', e => {
      simpleTriggerByType(e, e.currentTarget);
    })
  });
});

// Click outside to close ul.lang-menu in header.site-header
window.addEventListener("click", function (e) {
  const header = document.querySelector("header.site-header");
  if (!header) return;

  const clickedInsideSwitcher = e.target.closest(
    "[data-jq-switcher-trigger], [data-jq-switcher-target]"
  );

  if (clickedInsideSwitcher) return;

  header.querySelectorAll("[data-jq-switcher-trigger].active, [data-jq-switcher-target].active").forEach(elm => {
    elm.classList.remove("active");
  });
});