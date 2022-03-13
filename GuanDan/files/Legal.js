import Combo from "./Combo.js";
import Card from "./Card.js";

export default class Legal {

    // compare 2 combos
    static isLegal(combo1, combo2) {// combo2 = curHand.t.topCombo
        let legalRes = [];
        if (combo1 == null || combo1.all.length == 0) {
            return legalRes;
        }
        if (combo1.resCombo.length == 0) {// combo1 is not a valid template
            return legalRes;
        }
        if (combo2 == null) {
            legalRes = combo1.resCombo;//all results are legal
            return legalRes;
        } else {// combo1 should follow the template and larger than combo2
            if (combo2.iCombo == 8) {//combo2 is a bomb
                for (let template of combo1.resCombo) {
                    if (template[0] == 8 && (template[1] > combo2.iBomb || (template[1] == combo2.iBomb && Card.powers[template[2]] > Card.powers[combo2.iRank]))) {
                        legalRes.push(template);
                    }
                }
            } else {//combo2 is not a bomb
                for (let template of combo1.resCombo) {
                    if ((template[0] == combo2.iCombo && Card.powers[template[2]] > Card.powers[combo2.iRank]) || (template[0] == 8)) {
                        legalRes.push(template);
                    }
                }
            }
            return legalRes;
        }
    }
}


