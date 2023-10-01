extensionActive();

window.addEventListener('message', event => {
    const trusted = ["https://rol.raiffeisenbank.rs", "https://wolt.com"];

    if (trusted.includes(event.origin) && event.data.name && event.data.value) {
        save(event.data.name, event.data.value);
    }
});

function openRaiff() {
    const raiff = window.open("https://rol.raiffeisenbank.rs/Retail/Home/Login");
    window.openedTab = raiff;
    setInterval(() => {
        try {
            raiff.postMessage({ type: "heartbeat" }, "https://rol.raiffeisenbank.rs");
        } catch (e) { }
    }, 1000);
}

function openWolt() {
    const wolt = window.open("https://wolt.com");
    window.openedTab = wolt;
    setInterval(() => {
        try {
            wolt.postMessage({ type: "heartbeat" }, "https://wolt.com");
        } catch (e) { }
    }, 1000);
}
