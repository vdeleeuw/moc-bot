export class PoeApiGetCharactersResponse {
    data: PoeApiCharacter[];
}

export class PoeApiCharacter {
    name: string;
    league: string;
    classId: number;
    ascendancyClass: number;
    class: string;
    level: number;
    experience: number;
}
