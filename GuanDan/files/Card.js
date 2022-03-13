import Utils from "./Utils.js";
import Player from "./Player.js";

export default class Card {

    constructor(iS, iR) {
        this.iS = iS;
        this.iR = iR;
        this.loc = null;
        Utils.setNdx(Card.all, this);
    }

    static all = [];
    static ranks = '2 3 4 5 6 7 8 9 T J Q K A ♔ ♕ 2'.split(' ');//last position is for level card, change when set card powers
    static powers = [];
    static suits = ['&clubs;', '&diams;', '&spades;', '&hearts;', '&#127167;', '&#127167;'];
    static suitColors = ['black', 'red', 'black', 'red', 'black', 'red'];

    static createAll = function () {
        for (let iR = 0; iR < 13; iR++) {
            for (let iS = 0; iS < 4; iS++) {
                new Card(iS, iR);
                new Card(iS, iR);
            }
        }
        new Card(4, 13);
        new Card(4, 13);
        new Card(5, 14);
        new Card(5, 14);
    }

    static showAll = function () {
        let result = '', sep = '';
        for (let i = 0; i < Card.all.length; i++) {
            let c = Card.all[i];
            result += sep + c.name(); sep = ' ';
        }
        return result;
    }

    static setCardsPower() {
        for (let i = 0; i < 13; i++) {
            Card.powers.push(i); // 2-0, 3-1, J-9, Q-10, K-11
        }
        Card.powers.push(50);// black joker
        Card.powers.push(100);// red joker
        Card.powers.push(20);// level card
        Card.ranks[15] = Card.ranks[iLevel];
    }

    static findMostPowerCard(cards) {// return array since most power have tie
        let result = [cards[0]];
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].iR == iLevel && cards[i].iS == 3) {
                continue;// wild card not include
            }
            if (Card.powers[cards[i].iR == iLevel ? 15 : cards[i].iR] > Card.powers[result[0].iR == iLevel ? 15 : result[0].iR]) {
                result = [cards[i]];
            } else if (Card.powers[cards[i].iR == iLevel ? 15 : cards[i].iR] == Card.powers[result[0].iR == iLevel ? 15 : result[0].iR]) {
                result.push(cards[i])
            }
        }
        return result;
    }

    static findLegalReturnCard(cards) {// less than or equal to 10 && not include level card
        let result = [];
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].iR != iLevel && cards[i].iR <= 8) {
                result.push(cards[i])
            }
        }
        return result;
    }

    static CardInHand(player) {
        let result = [];
        for (let card of Card.all) {
            if (card.loc == player.hand) {
                result.push(card);
            }
        }
        return result;
    }

    sel() {
        return '<span class="modifyHook" onclick="cardEvent(' + this.ndx + ');">' + this.name() + '</span>';
    }

    name() {
        return Card.ranks[this.iR] + Utils.cSpan(Card.suitColors[this.iS], Card.suits[this.iS]);
    }

    selGrey() {
        return '<span class="modifyHook" onclick="cardEvent(' + this.ndx + ');">' + this.greyName() + '</span>';
    }

    greyName() {
        return Utils.cSpan('grey', Card.ranks[this.iR] + Card.suits[this.iS]);
    }

}
