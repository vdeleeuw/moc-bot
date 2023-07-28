export class PoeApiGetLeaguesResponse {
    data: PoeApiLeague[];
}

class PoeApiLeague {
    id: string;
    realm: string;
    description: string;
    registerAt: string;
    url: string;
    startAt: string;
    endAt: string;
    delveEvent: boolean;
    rules: PoeApiLeagueRule[];
}

class PoeApiLeagueRule {
    id: string;
    name: string;
    description: number;
}
