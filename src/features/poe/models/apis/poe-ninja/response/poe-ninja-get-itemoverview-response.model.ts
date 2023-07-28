export class PoeNinjaGetItemOverviewResponse {
    data: PoeNinjaLines;
}

class PoeNinjaLines {
    lines: PoeNinjaItem[];
}

class PoeNinjaItem {
    name: string;
    stackSize: number;
    explicitModifiers: PoeNinjaExplicitModifier;
    chaosValue: number;
}

class PoeNinjaExplicitModifier {
    text: string;
}
