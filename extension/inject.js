const inject = document.createElement('script');
inject.src = chrome.runtime.getURL(location.hostname + ".js");
document.head.appendChild(inject);
