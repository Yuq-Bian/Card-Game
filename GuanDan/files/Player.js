import Loc from "./Loc.js";
import Card from "./Card.js";
import Utils from "./Utils.js";

export default class Player {

    constructor(name) {
        this.name = name;
        Utils.setNdx(Player.all, this);
        this.level = 0;
        this.team = this.ndx % 2 == 0 ? 1 : 2;
        this.selected = new Loc('selected', this);
        this.hand = new Loc('hand', this);
    }

    static all = [];

    static createAll(str) {
        let arr = str.split(' ');
        for (let i = 0; i < 4; i++) {
            new Player(arr[i]);
        }
    }

    static showAll() {
        let result = '', sep = '   ';
        for (let i = 0; i < 4; i++) {
            let p = Player.all[i];
            result += p.name + '<span class="badge bg-danger">' + Card.ranks[p.level] + '</span>' + sep;
        }
        return result;
    }

    left() { return Player.all[(this.ndx + 1) % 4]; }

    next() {
        let result = this.left();
        while (curHand.playerRankList.includes(result)) {
            result = result.left();
        }
        return result;
    }

}
