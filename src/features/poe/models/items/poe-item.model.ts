import { PoeItemType } from ".";
import { PoeStashTab } from "../poe-stash-tab.model";

export class PoeItem {
    // nom
    name: string;
    // type
    type?: PoeItemType;
    // taille stack
    stackSize: number;
    // valeur unitaire en chaos
    estimatedValueEach?: number;
    // stash tab ou est l'item
    stashTab?: PoeStashTab;
}
