const detectBrowserVersion = (function (agent) {
  const iOS = !!agent.match(/ipad/i) || !!agent.match(/iphone/i);
  const webkit = !!agent.match(/webkit/i);
  const iOSSafari = iOS && webkit && !agent.match(/crios/i) && !agent.match(/opios/i); // exclude CriOS(Chrome) & OPiOS(Opera)
  const iOSChrome = iOS && webkit && !!agent.match(/crios/i);

  switch (true) {
    case iOSSafari == true:
      return "ios-safari";

    case iOSChrome == true:
      return "ios-chrome";

    case agent.indexOf("edge") > -1:
      return "edge";

    case agent.indexOf("edg") > -1:
      return "edge-chromium";

    case agent.indexOf("opr") > -1 && !!window.opr:
      return "opera";

    case agent.indexOf("chrome") > -1 && !!window.chrome:
      return "chrome";

    case agent.indexOf("trident") > -1:
      return "ie";

    case agent.indexOf("firefox") > -1:
      return "firefox";

    case agent.indexOf("safari") > -1:
      return "safari";

    default:
      return "";
  }
})(window.navigator.userAgent.toLowerCase());


document.documentElement.classList.add(detectBrowserVersion);