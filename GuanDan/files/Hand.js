import Card from './Card.js';
import Player from './Player.js';
import Trick from './Trick.js';
import Utils from "./Utils.js";
import Loc from "./Loc.js";

export default class Hand {

    constructor(tributePayerList, tributeReceiverList) {
        this.t = new Trick();
        this.tributePayerList = tributePayerList;
        this.tributeReceiverList = tributeReceiverList;
        this.tributeCards = [];
        this.tributePlayers = [];// the same order with tribute cards
        this.receiveReturnCardOrder = [];
        this.remainCards = [nHand, nHand, nHand, nHand];
        this.playerRankList = [];
        Card.setCardsPower();
    }

    isOver() {
        let teamSet = new Set();
        for (let p of this.playerRankList) {
            if (teamSet.has(p.team)) {
                return true;
            }
            teamSet.add(p.team);
        }
        return false;
    }

    completeRankList() {// call after isOver
        for (let p of Player.all) {
            if (!this.playerRankList.includes(p)) {
                this.playerRankList.push(p);
            }
        }
    }

    calculateScore() {// increment level and return info of the tribute
        let tribute = [[], []];//[[tributePayerList],[tributeReceiverList]]
        if (this.playerRankList[0].team == this.playerRankList[1].team) {
            this.playerRankList[0].level = Math.min(this.playerRankList[0].level + 3, 12);
            this.playerRankList[1].level = Math.min(this.playerRankList[1].level + 3, 12);
            tribute[0].push(this.playerRankList[2]);// order doesn't matter
            tribute[0].push(this.playerRankList[3]);
            tribute[1].push(this.playerRankList[0]);// order matters
            tribute[1].push(this.playerRankList[1]);
        } else if (this.playerRankList[0].team == this.playerRankList[2].team) {
            this.playerRankList[0].level = Math.min(this.playerRankList[0].level + 2, 12);
            this.playerRankList[2].level = Math.min(this.playerRankList[2].level + 2, 12);
            tribute[0].push(this.playerRankList[3]);
            tribute[1].push(this.playerRankList[0]);
        } else {
            this.playerRankList[0].level = this.playerRankList[0].level + 1;
            this.playerRankList[3].level = this.playerRankList[3].level + 1;
            tribute[0].push(this.playerRankList[3]);
            tribute[1].push(this.playerRankList[0]);
        }
        iLevel = this.playerRankList[0].level;
        return tribute;
    }

    payTribute() {
        //check if need tribute
        if (this.twoJokers()) {
            curPlayer = this.tributeReceiverList[0];
            Utils.msg('Tribute payer get two red jokers. No tribute! ' + 'It is ' + curPlayer.name + "'s turn.");
            takeAction2 = window.passThisTurn;
            window.repaint();
        } else {
            curPlayer = this.tributePayerList[0];
            Utils.inject('PLAYER', Utils.showPlayerName(curPlayer));
            Utils.msg('It is ' + curPlayer.name + "'s turn." + "Pay a tribute.");
            this.showLegalTributeCard();
            cardEvent = window.tributeCard;
        }
    }

    showLegalTributeCard() {
        let mostPowerCard = Card.findMostPowerCard(Card.CardInHand(curPlayer));
        Utils.inject('CARDS', Loc.showTributeCard(mostPowerCard));
    }

    showLegalReturnCard() {
        let legalReturnCard = Card.findLegalReturnCard(Card.CardInHand(curPlayer));
        Utils.inject('CARDS', Loc.showReturnCard(legalReturnCard));
    }

    showTributeDeck() {
        if (this.tributeCards.length == 2 && this.tributeCards[0].iR == this.tributeCards[1].iR) {
            //tie, user select
            curPlayer = this.tributeReceiverList[0];
            Utils.msg('It is ' + curPlayer.name + "'s turn." + "Select a tribute card.");
            Utils.inject('CARDS', showTributeSelRed(this.tributeCards));//show tributeDeck with card event
            cardEvent = selectTributeCard;
        } else {
            Utils.msg('Show tribute cards.');
            Utils.inject('CARDS', Loc.showAll());//show tributeDeck without event
            Utils.inject('ACTION', "return process");
            takeAction = window.returnProcess;
            // auto allocate tribute cards
            this.allocateTributeCard();
        }
    }

    twoJokers() {
        if (this.tributePayerList.length == 1) {
            return Card.all[106].loc == this.tributePayerList[0].hand && Card.all[107].loc == this.tributePayerList[0].hand
        } else if (this.tributePayerList.length == 2) {
            return (Card.all[106].loc == this.tributePayerList[0].hand || Card.all[106].loc == this.tributePayerList[1].hand)
                && (Card.all[107].loc == this.tributePayerList[0].hand || Card.all[107].loc == this.tributePayerList[1].hand)
        } else {
            alert('should not happen')
        }
    }

    allocateTributeCard() {//compare 2 tribute cards and allocate, determine the next player
        if (this.tributeCards.length == 1) {
            this.tributeCards[0].loc = this.tributeReceiverList[0].hand;
        } else if (this.tributeCards.length == 2) {
            if (Card.powers[this.tributeCards[0].iR == iLevel ? 15 : this.tributeCards[0].iR]
                < Card.powers[this.tributeCards[1].iR == iLevel ? 15 : this.tributeCards[1].iR]) {
                this.tributeCards[1].loc = this.tributeReceiverList[0].hand;
                this.tributeCards[0].loc = this.tributeReceiverList[1].hand;
                this.receiveReturnCardOrder.push(this.tributePlayers[1]);
                this.receiveReturnCardOrder.push(this.tributePlayers[0]);
            } else if (Card.powers[this.tributeCards[0].iR == iLevel ? 15 : this.tributeCards[0].iR]
                > Card.powers[this.tributeCards[1].iR == iLevel ? 15 : this.tributeCards[1].iR]) {
                this.tributeCards[0].loc = this.tributeReceiverList[0].hand;
                this.tributeCards[1].loc = this.tributeReceiverList[1].hand;
                this.receiveReturnCardOrder.push(this.tributePlayers[0]);
                this.receiveReturnCardOrder.push(this.tributePlayers[1]);
            }
        } else {
            alert('should not happen')
        }
    }

}