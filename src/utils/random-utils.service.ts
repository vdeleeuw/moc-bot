import { injectable } from "inversify";
import { Chance } from "chance";
import { MESSAGE_EMOJI_COMPLIMENT, MESSAGE_EMOJI_INSULTE } from "../features/message/constants";

@injectable()
export class RandomUtils {
    private randomizer: Chance.Chance;

    constructor() {
        this.randomizer = new Chance();
    }

    /**
     * Tente un jet random
     *
     * @param {*} probabilite la chance d'avoir un true
     */
    bool(probabilite: number): boolean {
        return this.randomizer.bool({ likelihood: probabilite });
    }

    /**
     * Retourne une color random
     */
    colorHex(): string {
        return this.randomizer.color({ format: "hex" });
    }

    /**
     * Retourne une insulte random
     */
    getOneEmojiInsulte(): string[] {
        return MESSAGE_EMOJI_INSULTE[this.randomizer.integer({ min: 0, max: MESSAGE_EMOJI_INSULTE.length - 1 })];
    }

    /**
     * Retourne un compliment random
     */
    getOneEmojiCompliment(): string[] {
        return MESSAGE_EMOJI_COMPLIMENT[this.randomizer.integer({ min: 0, max: MESSAGE_EMOJI_COMPLIMENT.length - 1 })];
    }
}
