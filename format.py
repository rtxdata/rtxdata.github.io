import json
import sys

dry_run = True if len(sys.argv) == 2 and sys.argv[1] == "--dry-run" else False

with open('./public/patterns.json', 'r') as file:
    patterns = json.load(file)

for category in patterns:
    for name in patterns[category]:
        assert isinstance(patterns[category][name],
                          str), "Неправильный формат данных"
        if dry_run:
            assert name == name.lower(), "Паттерны должны быть в нижнем регистре"

if not dry_run:
    with open('./public/patterns.json', 'w') as file:
        formated = {key: {k.lower(): v for (k, v) in value.items()}
                    for (key, value) in patterns.items()}
        json.dump(formated, file, ensure_ascii=False, indent=4)
