import Card from './Card.js';
import Loc from './Loc.js';
import Player from './Player.js';
import Utils from './Utils.js';
import Combo from './Combo.js';
import Hand from './Hand.js';
import Legal from './Legal.js';
import Trick from './Trick.js';

//-------------------global variables----------------------------     
window.iLevel = 0;
window.deck = new Loc('Deck', null);
window.discard = new Loc('Discard Deck', null);
window.tributeDeck = new Loc('Tribute Deck', null);
window.nPlayer = 4;
window.nHand = 27;
window.curPlayer = null;
window.curHand = null;
window.curCombo = null;
window.potentialCombos = [];
window.cardEvent = null;
window.takeAction = null;
window.takeAction2 = null;

//-----------------game onload----------------------------------------
window.onload = function () {
    initialize();
}

//-----------------initialize a new game---------------------------------
function initialize() {
    iLevel = 0;
    curPlayer = null;
    curHand = null;
    curCombo = null;
    potentialCombos = [];
    Player.createAll('Archie Betty Jughead Veronica');//create 4 players
    Card.createAll();// create 108 cards
    for (let i = 0; i < Card.all.length; i++) {// put cards to deck
        let c = Card.all[i];
        c.loc = deck;
    }
    Utils.inject('ACTION', 'play first hand');
    takeAction = playFirstHand;
    Utils.inject('PASS', 'pass');
    takeAction2 = Utils.invalid;
    Utils.inject('PLAYERS', Player.showAll());
    Utils.inject('PLAYER', Utils.showPlayerName(curPlayer));
    Utils.inject('iLEVEL', Card.ranks[iLevel]);
    Utils.inject('CARDS', Loc.showAll());//no event
}

//------------------------repaint-------------------------------------------
window.repaint = function () {
    Utils.inject('PLAYERS', Player.showAll());
    Utils.inject('PLAYER', Utils.showPlayerName(curPlayer));
    Utils.inject('iLEVEL', Card.ranks[iLevel]);
    Utils.inject('CARDS', Loc.showAllSelRed());
    if (curHand && curHand.t.topCombo) {
        Utils.inject('PREV_CARDS', Utils.showCards(curHand.t.topCombo.all) + ' ('
            + Combo.comboNames[curHand.t.topCombo.iCombo] + '-'
            + Combo.bombNames[curHand.t.topCombo.iBomb] + '-'
            + Card.ranks[curHand.t.topCombo.iRank] + ' )');
    } else {
        Utils.inject('PREV_CARDS', '');
    }
    if (curHand) {
        Utils.inject('LEAD', Utils.showPlayerName(curHand.t.lead));
    } else {
        Utils.inject('LEAD', '');
    }
}

//----------------------------------deal-------------------------------   
function deal() {
    let locA = [];
    for (let p = 0; p < nPlayer; p++) {
        for (let i = 0; i < nHand; i++) { locA.push(Player.all[p].hand); }
    }
    Utils.fyShuffle(locA, 108);
    for (let i = 0; i < 108; i++) { Card.all[i].loc = locA[i]; }
}

//----------------------------playFirstHand---------------------------------
function playFirstHand() {
    deal();

    let luckyNdx = Utils.rnd(108);
    let firstToPlayCard = Card.all[luckyNdx];
    curPlayer = firstToPlayCard.loc.player;
    Utils.msg('Lucky card is ' + firstToPlayCard.name() + '. ' + curPlayer.name + ' should paly first.');

    let tributePayerList = [], tributeReceiverList = [];
    curHand = new Hand(tributePayerList, tributeReceiverList);// new hand with empty tribute
    curCombo = new Combo();

    Utils.inject('ACTION', 'submit cards');
    takeAction = Utils.invalid;//can not submit until combo is legal
    takeAction2 = passThisTurn;
    cardEvent = selectOrCancelEvent;
    repaint();
}

//---------------------------------selectOrCancelEvent--------------------------------

function selectOrCancelEvent(iC) {
    let selCard = Card.all[iC];
    if (selCard.loc.player != curPlayer) { alert('It is ' + curPlayer.name + "'s move."); return; }
    if (selCard.loc == curPlayer.hand) {// go to selected from hand
        selCard.loc = curPlayer.selected;
        curCombo.all.push(selCard);
        curCombo.build();
        potentialCombos = Legal.isLegal(curCombo, curHand.t.topCombo);
        if (potentialCombos.length > 0) {
            takeAction = submitCards;
            Utils.inject('CARDS', Loc.showAllSelRed());
        } else {
            takeAction = Utils.invalid;
            Utils.inject('CARDS', Loc.showSelectedGrey());
        }
    } else if (selCard.loc == curPlayer.selected) {//back to hand from selected
        selCard.loc = curPlayer.hand;
        Utils.removeElement(curCombo.all, selCard);
        curCombo.build();
        potentialCombos = Legal.isLegal(curCombo, curHand.t.topCombo);
        if (potentialCombos.length > 0) {// curCombo.all=[] not legal cannot submit can only pass
            takeAction = submitCards;
            Utils.inject('CARDS', Loc.showAllSelRed());
        } else {
            takeAction = Utils.invalid;
            Utils.inject('CARDS', Loc.showSelectedGrey());
        }
    }
}

//----------------------------submit cards------------------------------------
function generateSelectionButtons() {
    let result = '';
    for (let i = 0; i < potentialCombos.length; i++) {
        result += '<button type="button" class="btn btn-warning comboButton" onclick="chooseCombo(' + i + ')">'
            + Combo.comboNames[potentialCombos[i][0]] + '-'
            + Combo.bombNames[potentialCombos[i][1]] + '-'
            + Card.ranks[potentialCombos[i][2]];
        + '</button>';
    }
    return result;
}

window.chooseCombo = function (k) {
    Utils.inject('SELECT', '');
    curCombo.iCombo = potentialCombos[k][0];
    curCombo.iBomb = potentialCombos[k][1];
    curCombo.iRank = potentialCombos[k][2];
    afterSubmit();
}

function afterSubmit() {
    for (let card of curCombo.all) {
        card.loc = discard;
        curHand.remainCards[curPlayer.ndx]--;
    }
    curHand.t.topCombo = curCombo;
    curCombo = new Combo();
    curHand.t.lead = curPlayer;
    curHand.t.havePass = [false, false, false, false];//every submit reset havePass

    //check if the player play out all cards at every submit
    if (curHand.remainCards[curPlayer.ndx] == 0) {
        curHand.playerRankList.push(curPlayer);
    }
    //check if this hand is over
    if (curHand.isOver()) {
        curHand.completeRankList();
        curPlayer = null;
        Utils.inject('ACTION', 'next hand');
        Utils.msg('Hand over!');
        takeAction = nextHand;
        takeAction2 = Utils.invalid;
        repaint();
        return;
    }
    // next player
    curPlayer = curPlayer.next();
    Utils.msg('It is ' + curPlayer.name + "'s turn.");
    repaint();
}

function submitCards() {
    takeAction = Utils.invalid;
    if (potentialCombos.length == 1) {
        curCombo.iCombo = potentialCombos[0][0];
        curCombo.iBomb = potentialCombos[0][1];
        curCombo.iRank = potentialCombos[0][2];
    } else {//potentialCombos.length > 1, user select
        Utils.inject('SELECT', generateSelectionButtons());
        Utils.msg('It is ' + curPlayer.name + "'s turn. Please select a combo.");
        return;
    }
    afterSubmit();
}

//------------------------------pass this turn--------------------------------
window.passThisTurn = function passThisTurn() {
    if (curHand.t.lead == null) {//curPlayer is the first turn
        alert('can not pass first turn.');
        return;
    }
    // now can pass this turn
    //return back all the cards in selected
    for (let card of curCombo.all) {
        card.loc = curPlayer.hand;
    }
    curCombo = new Combo();
    curHand.t.havePass[curPlayer.ndx] = true;
    curPlayer = curPlayer.next();
    Utils.msg('It is ' + curPlayer.name + "'s turn.");
    //check next player
    if (curPlayer == curHand.t.lead) {// no one can bid
        curHand.t = new Trick();
    }
    if (curHand.t.havePass[curPlayer.ndx]) {// lead play out all cards and no one can bid, next player should be his partner
        curPlayer = curHand.t.lead.left().left();
        Utils.msg('It is ' + curPlayer.name + "'s turn.");
        curHand.t = new Trick();
    }
    repaint();
}

//----------------------------next hand---------------------------------------
function nextHand() {
    Utils.inject('ACTION', 'submit cards');
    takeAction = Utils.invalid;
    if (curHand.playerRankList[0].level == 12) {// game over
        Utils.inject('H2', 'Game over. Winner is team: ' + curHand.playerRankList[0].team);
        Utils.inject('ACTION', 'new game');
        takeAction = initialize;
        return;
    }
    let tributeList = curHand.calculateScore();
    curHand = new Hand(tributeList[0], tributeList[1]);
    deal();
    Utils.inject('PLAYERS', Player.showAll());
    Utils.inject('PLAYER', Utils.showPlayerName(curPlayer));
    Utils.inject('iLEVEL', Card.ranks[iLevel]);
    Utils.inject('CARDS', Loc.showAll());//no event
    Utils.inject('PREV_CARDS', '');
    Utils.inject('LEAD', '');
    curHand.payTribute();

}

//----------------------tribute------------------------------------------------
window.tributeCard = function (iC) {
    let selCard = Card.all[iC];
    selCard.loc = tributeDeck;
    curHand.tributeCards.push(selCard);
    curHand.tributePlayers.push(curPlayer);
    if (curHand.tributePayerList.length == 1) {// only 1 payer
        curHand.showTributeDeck();
        curPlayer = curHand.tributeReceiverList[0];
    } else if (curHand.tributePayerList.length == 2 && curPlayer == curHand.tributePayerList[0]) {
        curPlayer = curHand.tributePayerList[1];
        Utils.inject('PLAYER', Utils.showPlayerName(curPlayer));
        Utils.msg('It is ' + curPlayer.name + "'s turn." + 'Pay a tribute.');
        // show legal tribute cards with event
        curHand.showLegalTributeCard();
    } else if (curHand.tributePayerList.length == 2 && curPlayer == curHand.tributePayerList[1]) {
        curHand.showTributeDeck();
    } else {
        alert('should not happen');
    }
}

function returnCard(iC) {
    let selCard = Card.all[iC];
    if (curHand.tributePayerList.length == 1) {
        selCard.loc = curHand.tributePayerList[0].hand;
        curPlayer = curHand.tributePayerList[0];//ready to play 
        repaint();
        Utils.msg('It is ' + curPlayer.name + "'s turn.");
        Utils.inject('ACTION', 'submit cards');
        takeAction = Utils.invalid;
        takeAction2 = window.passThisTurn;
        cardEvent = selectOrCancelEvent;
    } else if (curHand.tributePayerList.length == 2 && curPlayer == curHand.tributeReceiverList[0]) {
        selCard.loc = curHand.receiveReturnCardOrder[0].hand;
        curPlayer = curHand.tributeReceiverList[1];
        Utils.inject('PLAYER', curPlayer.name);
        Utils.msg('It is ' + curPlayer.name + "'s turn." + 'Return a card.');
        curHand.showLegalReturnCard();
    } else if (curHand.tributePayerList.length == 2 && curPlayer == curHand.tributeReceiverList[1]) {
        selCard.loc = curHand.receiveReturnCardOrder[1].hand;
        curPlayer = curHand.receiveReturnCardOrder[0];//ready to play
        repaint();
        Utils.msg('It is ' + curPlayer.name + "'s turn.");
        Utils.inject('ACTION', 'submit cards');
        takeAction = Utils.invalid;
        takeAction2 = window.passThisTurn;
        cardEvent = selectOrCancelEvent;
    }
}

function selectTributeCard(iC) {// tribute cards tie, winner select
    let selCard = Card.all[iC];
    selCard.loc = curPlayer.hand;
    if (selCard == curHand.tributeCards[0]) {// winner return first, selection determine receive player
        curHand.receiveReturnCardOrder.push(curHand.tributePlayers[0])
        curHand.receiveReturnCardOrder.push(curHand.tributePlayers[1])
    } else {
        curHand.receiveReturnCardOrder.push(curHand.tributePlayers[1])
        curHand.receiveReturnCardOrder.push(curHand.tributePlayers[0])
    }
    for (let card of curHand.tributeCard) {// the other card automatically goes to 2nd winner
        if (card != selCard) {
            card.loc = curHand.tributeReceiverList[1].hand;
        }
    }
    Utils.inject('CARDS', Loc.showAll());
    Utils.inject('Action', 'return process');
    takeAction = returnProcess;
}

window.returnProcess = function () {
    curPlayer = curHand.tributeReceiverList[0];
    Utils.msg('It is ' + curPlayer.name + "'s turn." + 'Return a card.');
    curHand.showLegalReturnCard();
    cardEvent = returnCard;
}











