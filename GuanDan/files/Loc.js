import Card from './Card.js';
import Utils from './Utils.js';

export default class Loc {

    constructor(name, player) {
        this.player = player; // this can be null
        this.name = name;
        if (player != null) { this.name = player.name + "'s " + name; }
        Utils.setNdx(Loc.all, this);
    }

    static all = [];

    // show cards base on different show type
    static show(showType, cards = null){
        let fn;
        switch(showType){
            case 'showAll':
                fn = (e, ignored) => e.cardList();
                break;
            case 'showAllSelRed':
                fn = (e, ignored) => e.selCardList();
                break;
            case 'showTributeCard':
                fn = (e, cards) => e.tributeCardList(cards);
                break;
            case 'showReturnCard':
                fn = (e, cards) => e.returnCardList(cards);
                break;
            case 'showTributeSelRed':
                fn = (e, cards) => e.selectingTributeCardList(cards);
                break;
        }
        let result = '<div class="border-bottom border-secondary">';
        for (let i = 0; i < Loc.all.length; i++) {
            if (i == 3 || i == 5 || i == 7 || i == 9) {
                result += '</div><div class="border-bottom border-secondary">';
            }
            if (Loc.all[i].player == null || Loc.all[i].player == curPlayer) {
                result += '<br/>' + fn(Loc.all[i], cards);
            } else {
                if (i == 3 || i == 5 || i == 7 || i == 9) {
                    if (curHand) {
                        result += '<br/>' + Loc.all[i].player.name + '<span class="badge bg-secondary">' + curHand.remainCards[Loc.all[i].player.ndx] + '</span>';
                    } else {
                        result += '<br/>' + Loc.all[i].player.name;
                    }
                }else{
                    result += '<br/>' + '<br/>';
                }
            }
        }
        result += '</div>';
        return result;
    }

    static showAll() {
        return Loc.show('showAll');
    }

    static showAllSelRed() {
        return Loc.show('showAllSelRed');
    }
    
    static showTributeCard(tributeCards) {
        return Loc.show('showTributeCard', tributeCards);
    }

    static showReturnCard(returnCards) {
        return Loc.show('showReturnCard', returnCards);
    }

    static showTributeSelRed(tributeCards) {
        return Loc.show('showTributeSelRed', tributeCards)
    }

    static showSelectedGrey() {
        let result = '<div class="border-bottom border-secondary">';
        for (let i = 0; i < Loc.all.length; i++) {
            if (i == 3 || i == 5 || i == 7 || i == 9) {
                result += '</div><div class="border-bottom border-secondary">';
            }
            if (Loc.all[i].player == null) {
                result += '<br/>' + Loc.all[i].selCardList();
            } else if (Loc.all[i].player == curPlayer) {
                if (Loc.all[i].name == curPlayer.name + "'s " + 'selected') {
                    result += '<br/>' + Loc.all[i].selGreyCardList();
                } else {
                    result += '<br/>' + Loc.all[i].selCardList();
                }
            } else {
                if (i == 3 || i == 5 || i == 7 || i == 9) {
                    if (curHand) {
                        result += '<br/>' + Loc.all[i].player.name + '<span class="badge bg-secondary">' + curHand.remainCards[Loc.all[i].player.ndx] + '</span>';
                    } else {
                        result += '<br/>' + Loc.all[i].player.name;
                    }
                }else{
                    result += '<br/>' + '<br/>';
                }
            }
        }
        result += '</div>';
        return result;
    }

    cardList() {
        let result = Utils.lab(this.name + ':');
        for (var i = 0; i < 108; i++) {
            if (Card.all[i].loc == this) {
                result += ' ' + Card.all[i].name();
            }
        }
        return result;
    }

    selCardList() {
        let result = Utils.lab(this.name + ':');
        for (var i = 0; i < 108; i++) {
            if(this.ndx < 2){
                if (Card.all[i].loc == this) { result += ' ' + Card.all[i].name(); }
            }else{
                if (Card.all[i].loc == this) { result += ' ' + Card.all[i].sel(); }
            }
            
        }
        return result;
    }

    selGreyCardList() {
        let result = Utils.lab(this.name + ':');
        for (var i = 0; i < 108; i++) {
            if (Card.all[i].loc == this) { result += ' ' + Card.all[i].selGrey(); }
        }
        return result;
    }

    tributeCardList(tributeCards) {
        let result = Utils.lab(this.name + ':');
        for (var i = 0; i < 108; i++) {
            if (Card.all[i].loc == this) {
                if (tributeCards.includes(Card.all[i])) {
                    result += ' ' + Card.all[i].sel();
                } else {
                    result += ' ' + Card.all[i].greyName();
                }
            }
        }
        return result;
    }

    returnCardList(returnCards) {
        let result = Utils.lab(this.name + ':');
        for (var i = 0; i < 108; i++) {
            if (Card.all[i].loc == this) {
                if (returnCards.includes(Card.all[i])) {
                    result += ' ' + Card.all[i].sel();
                } else {
                    result += ' ' + Card.all[i].greyName();
                }
            }
        }
        return result;
    }

    selectingTributeCardList(tributeCards) {
        let result = Utils.lab(this.name + ':');
        for (var i = 0; i < 108; i++) {
            if (Card.all[i].loc == this) {
                if (tributeCards.includes(Card.all[i])) {
                    result += ' ' + Card.all[i].sel();
                } else {
                    result += ' ' + Card.all[i].greyName();
                }
            }
        }
        return result;
    }

}