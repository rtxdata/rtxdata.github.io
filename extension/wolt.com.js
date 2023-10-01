(async () => {
    async function onMessage(event) {
        // Игнорируем чужие сообщения
        if (event.origin !== "https://rtxdata.github.io") { return; }
        // При получении heartbeat
        if (event.data.type !== "heartbeat") { return; }

        // Только если есть залогин
        const token = decodeURIComponent(document.cookie).match(/__wtoken=[^,]+,"accessToken":"([^"]+)/)?.[1]
        if (!token) { return; }

        // Один раз
        window.removeEventListener("message", onMessage);

        // Скачиваем данные вольта
        const orders = [];

        for (let skip = 0; ; skip += 100) {
            document.body.innerText = `Обработка батча ${skip / 100 + 1}`;
            const batch = await fetch("https://restaurant-api.wolt.com/v2/order_details/?limit=100&skip=" + skip,
                { headers: { authorization: "Bearer " + token } }).then(res => res.json());
            orders.push(...batch);
            if (batch.length === 0) { break; }
        }

        // Отправляем обратно
        window.opener.postMessage({
            name: 'Wolt_' + new Date().toISOString() + '.json',
            // Данные о транзакциях
            value: JSON.stringify({ orders })
            // Данные может прочитать только RtxData
        }, "https://rtxdata.github.io");

        document.body.innerText = `Готово, окно можно закрыть`;
    }

    window.addEventListener("message", onMessage);
})();
