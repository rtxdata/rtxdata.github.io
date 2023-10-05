import React, { useState, useEffect } from "react";

export default function ExtensionButtons() {
    const [isExtensionActive, setIsExtensionActive] = useState(window.isExtensionActive);

    useEffect(() => {
        const handler = () => { setIsExtensionActive(true); };
        window.addEventListener('extensionActive', handler);
        return () => { window.removeEventListener('extensionActive', handler); };
    }, []);

    return isExtensionActive ?
        <div>
            <button onClick={() => window.openRaiff()}>Загрузить с raiffeisenbank.rs</button>{' '}
            <button onClick={() => window.openWolt()}>Загрузить с wolt.com</button>
        </div> : null;
}
