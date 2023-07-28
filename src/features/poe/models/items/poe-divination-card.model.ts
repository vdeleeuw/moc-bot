import { PoeItem } from "./poe-item.model";

export class PoeDivinationCard extends PoeItem {
    // taille max stack
    maxStackSize?: number;
    // recompense
    reward?: string;
}
