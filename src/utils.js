import patterns from './patterns.json';

export const ratesRsd = { "RSD": 1, "EUR": 117, "USD": 110 };

export function formatDateString(date) {
    const [d, m, y] = date.split(' ')[0].split('.');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function formatDateTime(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export function parseRef(ref) {
    for (let type in patterns) {
        for (let key in patterns[type]) {
            if (ref.includes(key)) {
                return [type, patterns[type][key]];
            }
        }
    }
    return ["other", ref];
}

export async function getDB() {

}