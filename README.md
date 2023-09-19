## RtxData - Анализ данных из Райфайзен Банка (Сербия)

- Безопасный: Для выгрузки не нужен пароль, только небольшой скрипт в консоли браузера
- Приватный: Данные остаются на устройстве
- Удобный: Работает в браузере

![Demo](./demo.png)

### Скачиваем свои данные

1) Логинимся в личном кабинете https://rol.raiffeisenbank.rs/Retail/Home/Login
2) Открываем консоль разработчика, в Chrome/Yandex/Firefox это `F12` или `Cmd + Opt + I`
3) Вставляем в консоль скрипт
```javascript
// Берем транзакции за 2023 год
filter = '"filterParam":{"FromDate":"01.01.2023","ToDate":"01.01.2024"}'

// URL фронтового API Райфа
base = "https://rol.raiffeisenbank.rs/Retail/Protected/Services/DataService.svc/"
// Получаем банковские счета
accounts = await fetch(base + "GetAllAccountBalance",
    { body: '{"gridName":"RetailAccountBalancePreviewFlat-L"}', 
    method: "POST" }).then(res => res.json());

// Получаем транзакции
transactions = {};
for (number of new Set(accounts.map(a => a[1]))) {
    // Скачиваем информацию о транзакции
    transactions[number] = await fetch(base + "GetTransactionalAccountTurnover", {
        body: '{"gridName":"RetailAccountTurnoverTransactionPreviewMasterDetail-S",' +
            '"productCoreID":"541","accountNumber":"' + number + '",' + filter + '}',
            method: "POST"}).then(res => res.json());
}

// Сохраняем транзакции как файл
element = document.createElement('a');
// Кодируем данные
element.href = URL.createObjectURL(new Blob([JSON.stringify({ transactions })],
    { type: "application/json" }));
// Сохраняем в загрузки
element.download = 'Raiff_2023_' + new Date().toISOString() + '.json';
element.click();
```
4) Ожидаем скачивания файла с транзакциями за 2023 год

### Строим графики, круговые диаграммы и таблицы

Способ не работает в Safari на Mac, тк в нем нет поддержки Web SQL

1) Заходим https://rtxdata.github.io
2) Открываем полученный `Raiff.json` и смотрим аналитику, данные обрабатываются на устройстве

### Пишем кастомные SQL запросы

1) Клонируем репозиторий `git clone git@github.com:rtxdata/rtxdata.github.io.git`
2) Кладем полученный `Raiff.json` в папку с репозиторием
3) `python3.9 -m venv .venv`
4) `. ./.venv/bin/activate`
5) `pip install -r requirements.txt`
6) Запускаем `jupyter notebook` или открываем `RtxData.ipynb` в VSCode с расширением Jupyter Notebook
7) Запускаем ячейки, запросы можно редактировать

#### Какой график получится?

- Круговая диаграмма будет построена если выбраны 2 колонки и вторая называется `total`
- Линия по датам будет построена если выбраны 2 колонки и первая называется `date`
- Таблица будет построена в остальных случаях

### Добавляем графики и пополняем классификатор

1) Запросы находятся в `dashboard.sql`, `init` выполняется перед всеми и нужен для вспомогательных таблиц
2) Классификатор находится в `patterns.json` и работает как паттерн матчинг, поддерживается только 2 уровня вложенности
3) Пожалуйста отправьте пулл реквест с новыми графиками и обновлениями классификатора

#### Перестроение категорий

- В случае Jupyter нужно перезагрузить kernel
- В случае браузера очистить данные сайта в DevTools