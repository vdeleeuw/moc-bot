import { PoeApiItem, PoeApiStashTab } from "..";

export class PoeApiGetStashItemsResponse {
    data: PoeApiStash;
}

class PoeApiStash {
    numTabs: number;
    items: PoeApiItem[];
    tabs: PoeApiStashTab[];
}
