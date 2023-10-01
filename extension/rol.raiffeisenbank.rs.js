(async () => {
    async function getTx() {
        // Берем транзакции за 2023 год
        const filter = '"filterParam":{"FromDate":"01.01.2023","ToDate":"01.01.2024"}'

        // URL фронтового API Райфа
        const base = "https://rol.raiffeisenbank.rs/Retail/Protected/Services/DataService.svc/"
        // Получаем банковские счета
        const accounts = await fetch(base + "GetAllAccountBalance",
            {
                body: '{"gridName":"RetailAccountBalancePreviewFlat-L"}',
                method: "POST"
            }).then(res => res.json());
        const uniqueAccounts = Array.from(new Set(accounts.map(a => a[1])));

        // Получаем транзакции
        const transactions = {};
        for (let i = 0; i < uniqueAccounts.length; i++) {
            document.body.innerText = `Обработка ${i + 1} из ${uniqueAccounts.length}`;
            const number = uniqueAccounts[i];

            // Скачиваем информацию о транзакции
            transactions[number] = await fetch(base + "GetTransactionalAccountTurnover", {
                body: '{"gridName":"RetailAccountTurnoverTransactionPreviewMasterDetail-S",' +
                    '"productCoreID":"541","accountNumber":"' + number + '",' + filter + '}',
                method: "POST"
            }).then(res => res.json());
        }

        return transactions;
    }

    async function onMessage(event) {
        // Игнорируем чужие сообщения
        if (event.origin !== "https://rtxdata.github.io") { return; }
        // При получении heartbeat
        if (event.data.type !== "heartbeat") { return; }
        // Только если есть залогин
        if (!document.querySelector(".profile-name.active")) { return; }

        // Один раз
        window.removeEventListener("message", onMessage);

        // Отправляем обратно
        window.opener.postMessage({
            name: 'Raiff_2023_' + new Date().toISOString() + '.json',
            // Данные о транзакциях
            value: JSON.stringify({ transactions: await getTx() })
            // Данные может прочитать только RtxData
        }, "https://rtxdata.github.io");

        document.body.innerText = `Готово, окно можно закрыть`;
    }

    window.addEventListener("message", onMessage);
})();
