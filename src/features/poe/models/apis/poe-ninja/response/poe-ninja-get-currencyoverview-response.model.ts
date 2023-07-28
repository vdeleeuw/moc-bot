export class PoeNinjaGetCurrencyOverviewResponse {
    data: PoeNinjaLines;
}

class PoeNinjaLines {
    lines: PoeNinjaCurrency[];
}

class PoeNinjaCurrency {
    currencyTypeName: string;
    chaosEquivalent: number;
}
