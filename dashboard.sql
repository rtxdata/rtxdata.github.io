-- init
CREATE TABLE POS AS SELECT id, SUM(sum) as sum, SUM(rsum) as rsum, curr, kat1, kat2, 
    date, type, card, ref, ref2, acc FROM TX WHERE sum < 0 AND type = "POS" GROUP BY curr, date, type, card, ref, ref2, acc;

-- По категориям
SELECT kat1, SUM(ABS(rsum)) as total FROM POS GROUP BY kat1 ORDER BY total DESC LIMIT 10;

-- Интернет
SELECT kat2, SUM(ABS(rsum)) as total FROM POS WHERE kat1 = 'internet' GROUP BY kat2 ORDER BY total DESC LIMIT 10;

-- Траты
SELECT date, SUM(ABS(rsum)) FROM POS GROUP BY date ORDER BY date ASC;

-- Транзакций в день
SELECT date, count(*) FROM POS GROUP BY date ORDER BY date ASC;

-- Динарных транзакций в день
SELECT date, count(*) FROM POS WHERE curr = 'RSD' GROUP BY date ORDER BY date ASC;

-- Не динарных транзакций в день
SELECT date, count(*) FROM POS WHERE curr != 'RSD' GROUP BY date ORDER BY date ASC;

-- Макдак с Июня
SELECT sum(abs(rsum)) FROM POS WHERE kat2='McDonalds' AND date > '2023-06-01';

-- Топ 5 трат
SELECT rsum, ref FROM POS ORDER BY rsum LIMIT 5;

-- Зарплата в евро
SELECT SUM(sum) / 117.3 FROM TX WHERE curr = 'RSD' AND type = 'Income';

-- Траты по валютам
SELECT SUM(ABS(sum)), curr FROM POS GROUP BY curr;

-- Эффективность конвертации

-- Зарубежные комиссии
