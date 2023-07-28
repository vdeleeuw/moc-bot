import { PoeLeagueRule } from ".";

export class PoeLeague {
    id: string;
    name: string;
    description: string;
    registerAt: Date;
    startAt: Date;
    endAt: Date;
    rules: PoeLeagueRule[];
}
