export default class Combo {

  constructor() {
    this.all = [];// all cards of this combo
    this.total = 0;
    this.h = [];
    this.resCombo = [];// potential result
    this.singles = [];
    this.pairs = [];
    this.triples = [];
    this.quadruples = [];
    this.quintuples = [];
    this.sextuples = [];
    this.septuples = [];
    this.octuples = [];
    this.nWILD = 0;// number of wild cards(0 or 1 or 2)
    this.iCombo = 0;// comboNames index
    this.iBombRank = [];// bombNames index and iRank
    this.iRank = [];// index of the card, can refer to Card.powers later
  }

  static n = 15;// 2 3 4 5 6 7 8 9 T J Q K A * ☿
  static comboNames = 'Invalid Single Pair Triple FullHouse Straight Pipe Plate Bomb'.split(' ');
  static bombNames = 'notBomb Four Five StraightFlush Six Seven Eight Nine Ten Jokers'.split(' ');

  // clear the histogram before adding elements
  clear() {
    this.h = [];
    for (let i = 0; i < Combo.n; i++) { this.h.push(0); }
    this.total = 0;
    this.singles = [];
    this.pairs = [];
    this.triples = [];
    this.quadruples = [];
    this.quintuples = [];
    this.sextuples = [];
    this.septuples = [];
    this.octuples = [];
    this.resCombo = [];
    this.nWILD = 0;
    this.iCombo = 0;
    this.iBombRank = [];
    this.iRank = [];
  }

  // fill the histogram and calculate resCombo, every time build the result clear first
  build() {
    this.clear();
    for (let card of this.all) { this.add(card); }
    this.stats();
    this.setComboType();
  }

  // add single card to histogram - identifies and separates WILD cards and LEV cards
  add(c) {
    this.total++;
    if (this.isWild(c)) { this.nWILD++; }
    else { this.addAt(c.iR); }
  }

  // adds i.e. increases the h count at a specified index
  addAt(k) { this.h[k]++; }

  isWild(c) { return c.iS == 3 && c.iR == iLevel; } //Hearts + level

  // computes the stats, scatters and sorts the singles, pairs and triplets
  stats() {
    for (let i = 0; i < Combo.n; i++) {
      if (this.h[i] == 1) { this.singles.push(i); }
      if (this.h[i] == 2) { this.pairs.push(i); }
      if (this.h[i] == 3) { this.triples.push(i); }
      if (this.h[i] == 4) { this.quadruples.push(i); }
      if (this.h[i] == 5) { this.quintuples.push(i); }
      if (this.h[i] == 6) { this.sextuples.push(i); }
      if (this.h[i] == 7) { this.septuples.push(i); }
      if (this.h[i] == 8) { this.octuples.push(i); }
    }
  }

  addAllToRes() {
    for (let i = 0; i < this.iRank.length; i++) { this.resCombo.push([this.iCombo, 0, this.iRank[i]]); }//iCombo,iBomb,iRank
  }

  // -- uses the scatter arrays to determine iCombo, iBomb, iRank
  setComboType() {
    if ((this.iRank = this.single()).length > 0) { this.iCombo = 1; this.addAllToRes(); }
    if ((this.iRank = this.pair()).length > 0) { this.iCombo = 2; this.addAllToRes(); }
    if ((this.iRank = this.triple()).length > 0) { this.iCombo = 3; this.addAllToRes(); }
    if ((this.iRank = this.fullHouse()).length > 0) { this.iCombo = 4; this.addAllToRes(); }
    if ((this.iRank = this.straight()).length > 0) { this.iCombo = 5; this.addAllToRes(); }
    if ((this.iRank = this.pipe()).length > 0) { this.iCombo = 6; this.addAllToRes(); }
    if ((this.iRank = this.plate()).length > 0) { this.iCombo = 7; this.addAllToRes(); }
    if ((this.iBombRank = this.isBomb()).length > 0) {
      this.iCombo = 8;
      for (let i = 0; i < this.iBombRank.length; i++) {
        this.resCombo.push([this.iCombo, this.iBombRank[i][0], this.iBombRank[i][1]]);// iCombo,iBomb,iRank
      }
    }
  }

  // -- functions that identify specific Combos: returns iRank 
  single() {
    let iRankRes = [];
    if (this.total != 1) { return iRankRes; }
    if (this.nWILD == 1) {// single wild card
      iRankRes.push(15);//level card
    } else {// nWILD == 0
      iRankRes.push(this.pushSelfOrILevel(this.singles[0]));
    }
    return iRankRes;
  }

  pair() {
    let iRankRes = [];
    if (this.total != 2) { return iRankRes; }
    if (this.nWILD == 0 && this.pairs.length == 1) {// no wild card, need a pair
      iRankRes.push(this.pushSelfOrILevel(this.pairs[0]));
    } else if (this.nWILD == 1 && this.singles[0] < 13) {// 1 wild card, the other should be a no joker single card
      iRankRes.push(this.pushSelfOrILevel(this.singles[0]));
    } else if (this.nWILD == 2) {
      iRankRes.push(15);
    }
    return iRankRes;
  }

  triple() {
    let iRankRes = [];
    if (this.total != 3) { return iRankRes; }
    if (this.nWILD == 0 && this.triples.length == 1) {// no wild card, need a triple
      iRankRes.push(this.pushSelfOrILevel(this.triples[0]));
    } else if (this.nWILD == 1 && this.pairs.length == 1 && this.pairs[0] < 13) {//1 wild card, the other 2 should be a no joker pair
      iRankRes.push(this.pushSelfOrILevel(this.pairs[0]));
    } else if (this.nWILD == 2 && this.singles[0] < 13) {// 2 wild cards, the other should be a no joker single
      iRankRes.push(this.pushSelfOrILevel(this.singles[0]));
    }
    return iRankRes;
  }

  fullHouse() {
    let iRankRes = [];
    if (this.total != 5) { return iRankRes; }
    if (this.nWILD == 0 && this.triples.length == 1 && this.pairs.length == 1) { // no wild card, need a triple and a pair     
      iRankRes.push(this.pushSelfOrILevel(this.triples[0]));
    } else if (this.nWILD == 1) {// 1 wild card, 3 + 1 or 2 + 2
      if (this.triples.length == 1 && this.singles[0] < 13) { //if there is a triple, the other card should be a no joker single
        iRankRes.push(this.pushSelfOrILevel(this.triples[0]));
      }
      if (this.pairs.length == 2) { // no triple, need 2 pairs 
        if (this.pairs[0] < 13) { iRankRes.push(this.pushSelfOrILevel(this.pairs[0])); }// pair to make triple should not be joker
        if (this.pairs[1] < 13) { iRankRes.push(this.pushSelfOrILevel(this.pairs[1])); }
      }
    } else if (this.nWILD == 2) {//2 wild cards, 3 or 2 + 1
      if (this.triples.length == 1) {
        iRankRes.push(this.pushSelfOrILevel(this.triples[0]));
      }
      if (this.pairs.length == 1) {
        if (this.pairs[0] < 13) { iRankRes.push(this.pushSelfOrILevel(this.pairs[0])); }//pair to make triple
        if (this.singles[0] < 13) { iRankRes.push(this.pushSelfOrILevel(this.singles[0])); }//single to make triple
      }
    }
    return iRankRes;
  }

  straight() {
    let iRankRes = [];
    if (this.total != 5) { return iRankRes; }
    if (this.nWILD == 0 && this.singles.length == 5 && this.singles[4] < 13) {// no wild card, need 5 singles no joker
      Array.prototype.push.apply(iRankRes, this.straightNoWildCard());
    } else if (this.nWILD == 1 && this.singles.length == 4 && this.singles[3] < 13) {// 1 wild card, need 4 singles no joker
      Array.prototype.push.apply(iRankRes, this.straightOneWildCard());
    } else if (this.nWILD == 2 && this.singles.length == 3 && this.singles[2] < 13) {// 2 wild card, need 3 singles no joker
      Array.prototype.push.apply(iRankRes, this.straightTwoWildCard());
    } else {// not legal template
    }
    return iRankRes;
  }

  pipe() {
    let iRankRes = [];
    if (this.total != 6) { return iRankRes; }
    if (this.nWILD == 0 && this.pairs.length == 3 && this.pairs[2] < 13) {// no wild card, need 3 pairs no joker
      Array.prototype.push.apply(iRankRes, this.pipeNoWildCard());
    } else if (this.nWILD == 1 && this.pairs.length == 2 && this.pairs[1] < 13 && this.singles[0] < 13) {// 1 wild card, need 2 pairs + 1 single no joker
      Array.prototype.push.apply(iRankRes, this.pipeOneWildCard());
    } else if (this.nWILD == 2) {// 2 wild cards, need 1+2+1 or 2+2
      Array.prototype.push.apply(iRankRes, this.pipeTwoWildCard());
    } else {// not legal template
    }
    return iRankRes;
  }

  plate() {
    let iRankRes = [];
    if (this.total != 6) { return iRankRes; }
    if (this.nWILD == 0 && this.triples.length == 2) {// no wild card, need 2 triples
      Array.prototype.push.apply(iRankRes, this.plateNoWildCard());
    } else if (this.nWILD == 1 && this.triples.length == 1 && this.pairs.length == 1 && this.pairs[0] < 13) {// 1 wild card, need 1 triple + 1 no joker pair
      Array.prototype.push.apply(iRankRes, this.plateOneWildCard());
    } else if (this.nWILD == 2) {//2 wild cards, need 3+1 or 2+2
      Array.prototype.push.apply(iRankRes, this.plateTwoWildCard());
    } else {// not legal template
    }
    return iRankRes;
  }

  isBomb() {//notBomb Four Five StraightFlush Six Seven Eight Nine Ten Jokers
    let iRankRes = [];
    if (this.total < 4) { return iRankRes; }
    if (this.total == 4) {
      if (this.nWILD == 0 && this.quadruples.length == 1) {
        iRankRes.push([1, this.pushSelfOrILevel(this.quadruples[0])]);
      }
      if (this.nWILD == 0 && this.pairs.length == 2 && this.pairs[0] == 13 && this.pairs[1] == 14) {// **☿☿
        iRankRes.push([9, 0]);
      }
      if (this.nWILD == 1 && this.triples.length == 1) {
        iRankRes.push([1, this.pushSelfOrILevel(this.triples[0])]);
      }
      if (this.nWILD == 2 && this.pairs.length == 1 && this.pairs[0] < 13) {
        iRankRes.push([1, this.pushSelfOrILevel(this.pairs[0])]);
      }
    } else if (this.total == 5) {
      if (this.nWILD == 0 && this.quintuples.length == 1) {
        iRankRes.push([2, this.pushSelfOrILevel(this.quintuples[0])]);
      }
      if (this.nWILD == 1 && this.quadruples.length == 1) {
        iRankRes.push([2, this.pushSelfOrILevel(this.quadruples[0])]);
      }
      if (this.nWILD == 2 && this.triples.length == 1) {
        iRankRes.push([2, this.pushSelfOrILevel(this.triples[0])]);
      }
      if (this.isSameSuit()) {
        let iRankTemp = this.straight();
        for (let i of iRankTemp) {
          iRankRes.push([3, i]);
        }
      }
    } else if (this.total == 6) {
      if (this.nWILD == 0 && this.sextuples.length == 1) {
        iRankRes.push([4, this.pushSelfOrILevel(this.sextuples[0])]);
      }
      if (this.nWILD == 1 && this.quintuples.length == 1) {
        iRankRes.push([4, this.pushSelfOrILevel(this.quintuples[0])]);
      }
      if (this.nWILD == 2 && this.quadruples.length == 1) {
        iRankRes.push([4, this.pushSelfOrILevel(this.quadruples[0])]);
      }
    } else if (this.total == 7) {
      if (this.nWILD == 0 && this.septuples.length == 1) {
        iRankRes.push([5, this.pushSelfOrILevel(this.septuples[0])]);
      }
      if (this.nWILD == 1 && this.sextuples.length == 1) {
        iRankRes.push([5, this.pushSelfOrILevel(this.sextuples[0])]);
      }
      if (this.nWILD == 2 && this.quintuples.length == 1) {
        iRankRes.push([5, this.pushSelfOrILevel(this.quintuples[0])]);
      }
    } else if (this.total == 8) {
      if (this.nWILD == 0 && this.octuples.length == 1) {
        iRankRes.push([6, this.pushSelfOrILevel(this.octuples[0])]);
      }
      if (this.nWILD == 1 && this.septuples.length == 1) {
        iRankRes.push([6, this.pushSelfOrILevel(this.septuples[0])]);
      }
      if (this.nWILD == 2 && this.sextuples.length == 1) {
        iRankRes.push([6, this.pushSelfOrILevel(this.sextuples[0])]);
      }
    } else if (this.total == 9) {
      if (this.nWILD == 1 && this.octuples.length == 1) {
        iRankRes.push([7, this.pushSelfOrILevel(this.octuples[0])]);
      }
      if (this.nWILD == 2 && this.septuples.length == 1) {
        iRankRes.push([7, this.pushSelfOrILevel(this.septuples[0])]);
      }
    } else if (this.total == 10) {
      if (this.nWILD == 2 && this.octuples.length == 1) {
        iRankRes.push([8, this.pushSelfOrILevel(this.octuples[0])]);
      }
    }
    return iRankRes;
  }

  //help function, check if the cards are same suit
  isSameSuit() {
    for (let i = 0; i < this.all.length; i++) {
      if (!this.isWild(this.all[i])) {
        if (this.all[i].iS != this.all[0].iS) {
          return false;
        }
      }
    }
    return true;
  }

  //help function, return 15 if the card is level card
  pushSelfOrILevel(index) {
    if (index == iLevel) {
      return 15;
    } else {
      return index;
    }
  }

  //straight help functions
  straightNoWildCard() {
    let resArray = [];
    if (this.singles[4] != 12 && this.singles[0] + 4 == this.singles[4]) {// no ace
      resArray.push(this.singles[4]);
    }
    if (this.singles[4] == 12) {// have ace
      if (this.singles[3] == 3) {// A 2 3 4 5 
        resArray.push(3);
      }
      if (this.singles[0] == 8) {// T J Q K A
        resArray.push(12);
      }
    }
    return resArray;
  }

  straightOneWildCard() {
    let resArray = [];
    if (this.singles[3] != 12) {// no ace
      if (this.singles[3] - this.singles[0] == 3) {// 4 consecutive singles, wild can fit either end
        resArray.push(this.singles[3] + 1);
        resArray.push(this.singles[3]);
      }
      if (this.singles[3] - this.singles[0] == 4) {// missing 1 in between
        resArray.push(this.singles[3]);
      }
    } else {// have ace
      if (this.singles[2] == 3 || this.singles[2] == 2) {// A 2 3 4 5
        resArray.push(3);
      }
      if (this.singles[0] == 8 || this.singles[0] == 9) {// T J Q K A
        resArray.push(12);
      }
    }
    return resArray;
  }

  straightTwoWildCard() {
    let resArray = [];
    if (this.singles[2] != 12) {// no ace
      if (this.singles[2] - this.singles[0] == 2) {// 3 consecutive singles, wild can fit either end or 2 ends
        if (this.singles[0] != 0) { resArray.push(this.singles[2]); }//2 wild cards add to the small end(exclude * * 2 3 4)
        resArray.push(this.singles[2] + 1);
        if (this.singles[2] != 11) { resArray.push(this.singles[2] + 2) };//2 wild cards add to the large end(exclude J Q K * *)
      }
      if (this.singles[2] - this.singles[0] == 3) {// missing 1 in between
        resArray.push(this.singles[2] + 1);
        resArray.push(this.singles[2]);
      }
      if (this.singles[3] - this.singles[0] == 4) {// missing 2 in between
        resArray.push(this.singles[2]);
      }
    } else {//have ace
      if (this.singles[2] == 3 || this.singles[2] == 2 || this.singles[2] == 1) {// missing 2 in A 2 3 4 5
        resArray.push(3);
      }
      if (this.singles[0] == 8 || this.singles[0] == 9 || this.singles[0] == 10) {//missing 2 in T J Q K A
        resArray.push(12);
      }
    }
    return resArray;
  }

  //pipe help functions
  pipeNoWildCard() {
    let resArray = [];
    if (this.pairs[2] != 12 && this.pairs[0] + 2 == this.pairs[2]) {// no ace
      resArray.push(this.pairs[2]);
    }
    if (this.pairs[2] == 12 && this.pairs[0] == 10) {// QQ KK AA
      resArray.push(12);
    }
    if (this.pairs[2] == 12 && this.pairs[1] == 1) {// AA 22 33
      resArray.push(1);
    }
    return resArray;
  }

  pipeOneWildCard() {
    let resArray = [];
    let arr = [this.pairs[0], this.pairs[1], this.singles[0]];
    arr.sort((a, b) => a - b);
    if (arr[2] != 12 && arr[0] + 2 == arr[2]) {// no ace
      resArray.push(arr[2]);
    }
    if (arr[2] == 12 && arr[0] == 10) {// QQ KK AA
      resArray.push(12);
    }
    if (arr[2] == 12 && arr[1] == 1) {// AA 22 33
      resArray.push(1);
    }
    return resArray;
  }

  pipeTwoWildCard() {
    let resArray = [];
    if (this.pairs.length == 2 && this.pairs[1] < 13) {// 2 pairs no joker
      if (this.pairs[1] != 12) {//no ace
        if (this.pairs[1] - this.pairs[0] == 1) {// 2 consecutive pairs, wild card can add either end
          resArray.push(this.pairs[1]);
          resArray.push(this.pairs[1] + 1);
        }
        if (this.pairs[1] - this.pairs[0] == 2) {// missing 1 in between
          resArray.push(this.pairs[1]);
        }
      } else {//have ace
        if (this.pairs[0] == 11 || this.pairs[0] == 10) {// QQ KK AA
          resArray.push(12);
        }
        if (this.pairs[0] == 0 || this.pairs[0] == 1) {// AA 22 33
          resArray.push(1);
        }
      }
    }
    if (this.pairs.length == 1 && this.pairs[0] < 13 && this.singles[1] < 13) {// 1 pair 2 singles no joker
      let arr = [this.pairs[0], this.singles[1], this.singles[0]];
      arr.sort((a, b) => a - b);
      if (arr[2] != 12 && arr[0] + 2 == arr[2]) {// no ace
        resArray.push(arr[2]);
      }
      if (arr[2] == 12 && arr[0] == 10) {// QQ KK AA
        resArray.push(12);
      }
      if (arr[2] == 12 && arr[1] == 1) {// AA 22 33
        resArray.push(1);
      }
    }
    return resArray;
  }

  //plate help functions
  plateNoWildCard() {
    let resArray = [];
    if (this.triples[1] != 12 && this.triples[0] + 1 == this.triples[1]) {// no ace
      resArray.push(this.triples[1]);
    } else {// have ace
      if (this.triples[0] == 11) {// KKK AAA
        resArray.push(12);
      }
      if (this.triples[0] == 0) {//AAA 222
        resArray.push(0);
      }
    }
    return resArray;
  }

  plateOneWildCard() {
    let resArray = [];
    if (this.triples[0] != 12 && this.pairs[0] != 12 && Math.abs(this.triples[0] - this.pairs[0]) == 1) {// no ace
      resArray.push(Math.max(this.triples[0], this.pairs[0]));
    }
    if (this.triples[0] == 12 && this.pairs[0] == 11 || this.pairs[0] == 12 && this.triples[0] == 11) {// KKK AAA
      resArray.push(12);
    }
    if (this.triples[0] == 12 && this.pairs[0] == 0 || this.pairs[0] == 12 && this.triples[0] == 0) {//AAA 222
      resArray.push(0);
    }
    return resArray;
  }

  plateTwoWildCard() {
    let resArray = [];
    if (this.triples.length == 1 && this.singles[0] < 13) {//1 triple , 1 no joker single
      if (this.triples[0] != 12 && this.singles[0] != 12 && Math.abs(this.triples[0] - this.singles[0]) == 1) {// no ace
        resArray.push(Math.max(this.triples[0], this.singles[0]));
      }
      if (this.triples[0] == 12 && this.singles[0] == 11 || this.singles[0] == 12 && this.triples[0] == 11) {// KKK AAA
        resArray.push(12);
      }
      if (this.triples[0] == 12 && this.singles[0] == 0 || this.singles[0] == 12 && this.triples[0] == 0) {//AAA 222
        resArray.push(0);
      }
    }
    if (this.pairs.length == 2 && this.pairs[1] < 13) {// 2 pairs no joker
      if (this.pairs[1] != 12 && this.pairs[0] + 1 == this.pairs[1]) {//no ace
        resArray.push(this.pairs[1]);
      }
      if (this.pairs[1] == 12 && this.pairs[0] == 11) {//KKK AAA
        resArray.push(12);
      }
      if (this.pairs[1] == 12 && this.pairs[0] == 0) {//AAA 222
        resArray.push(0);
      }
    }
    return resArray;
  }

}