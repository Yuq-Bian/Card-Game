export default class Utils {

    static inject(loc, val) { document.getElementById(loc).innerHTML = val; }
    static setNdx(list, item) { item.ndx = list.length; list.push(item); }
    static cSpan(c, x) { return '<span style="color:' + c + '">' + x + '</span>'; }
    static lab(x) { return '<span class="LAB">' + x + '</span>'; }
    static rnd(k) { return Math.floor(Math.random() * k); }
    static msg(x) { this.inject('MSG', x); }
    static invalid() { alert('Invalid!'); }
    static showCards(list) {
        let result = '', sep = '';
        for (let i = 0; i < list.length; i++) {
            let c = list[i];
            result += sep + c.name(); sep = ' ';
        }
        return result;
    }
    static showPlayerName(p) {
        if (p == null) {
            return '';
        }
        return p.name;
    }
    static fyShuffle(a, n) {
        for (let i = n; i > 1; i--) {
            let k = this.rnd(i);
            let t = a[i - 1]; a[i - 1] = a[k]; a[k] = t;
        }
    }
    static removeElement(arr, target) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                arr.splice(i, 1);
            }
        }
    }

}