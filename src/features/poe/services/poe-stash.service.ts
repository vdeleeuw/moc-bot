import { injectable, inject } from "inversify";
import { PoeApiCallService, PoeLeagueService, PoeItemService, PoeUserService, PoeDivinationCardService } from ".";
import { TYPES } from "../../../configuration";
import { PoeItem, PoeDivinationCard, PoeUser } from "../models";

@injectable()
export class PoeStashService {
    private poeApiCallService: PoeApiCallService;
    private poeLeagueService: PoeLeagueService;
    private poeItemService: PoeItemService;
    private poeUserService: PoeUserService;
    private poeDivinationCardService: PoeDivinationCardService;

    constructor(
        @inject(TYPES.PoeApiCallService) poeApiCallService: PoeApiCallService,
        @inject(TYPES.PoeLeagueService) poeLeagueService: PoeLeagueService,
        @inject(TYPES.PoeUserService) poeUserService: PoeUserService,
        @inject(TYPES.PoeItemService) poeItemsService: PoeItemService,
        @inject(TYPES.PoeDivinationCardService) poeDivinationCardService: PoeDivinationCardService,
    ) {
        this.poeApiCallService = poeApiCallService;
        this.poeLeagueService = poeLeagueService;
        this.poeUserService = poeUserService;
        this.poeItemService = poeItemsService;
        this.poeDivinationCardService = poeDivinationCardService;
    }

    /**
     * Récupère les items
     *
     * @param user le compte
     */
    async getStashItems(user: string): Promise<PoeItem[]> {
        const league = this.poeLeagueService.getPrivateLeagueOrChallengeLeague();
        const itemsRetour: PoeItem[] | PoeDivinationCard[] = [];
        let nbStash = 4;
        for (let i = 0; i < nbStash; ++i) {
            const resp = await this.poeApiCallService.getStashItems({
                accountName: user,
                league: (await league).name,
                public: false,
                realm: "pc",
                tabIndex: i,
                tabs: 1,
            });
            nbStash = resp.data.numTabs;
            const currentStashTab = resp.data.tabs.find((tabs) => tabs.selected);
            for (const poeApiItem of resp.data.items) {
                itemsRetour.push(this.poeItemService.buildNewPoeItem(poeApiItem, currentStashTab, user));
            }
        }
        return itemsRetour;
    }

    /**
     * Récupère les items de tout les users
     */
    async getStashItemsAllUsers(): Promise<Map<PoeUser, PoeItem[]>> {
        const mapItemUsers: Map<PoeUser, PoeItem[]> = new Map<PoeUser, PoeItem[]>();
        for (const user of this.poeUserService.getPoeUsers()) {
            mapItemUsers.set(
                user,
                user.token ? await this.poeItemService.estimateItems(await this.getStashItems(user.accountName)) : [],
            );
        }
        return mapItemUsers;
    }

    /**
     * Récupère les items de tout les users
     */
    async getCompleteDivinationCardAllUsers(): Promise<PoeDivinationCard[]> {
        const mapItemUsers = this.getStashItemsAllUsers();
        const allCards = this.poeDivinationCardService.prepareCardsStacksAllUsers(await mapItemUsers, 2);
        return this.poeDivinationCardService.filtrerFullStacksDivinationCards(allCards);
    }

    /**
     * Récupère les cards des users (non complétés)
     */
    async getNotCompleteDivinationCardStashAllUsers(): Promise<PoeDivinationCard[]> {
        const mapItemUsers = this.getStashItemsAllUsers();
        let allCards = this.poeDivinationCardService.prepareCardsStacksAllUsers(await mapItemUsers, 2);
        allCards = this.poeDivinationCardService.filtrerNotFullStacksDivinationCards(allCards);
        return this.poeDivinationCardService.sortByCompletionDesc(allCards);
    }

    /**
     * Récupère les cards des users (tous)
     */
    async getAllDivinationCardStashAllUsers(): Promise<PoeDivinationCard[]> {
        const mapItemUsers = this.getStashItemsAllUsers();
        const allCards = this.poeDivinationCardService.prepareCardsStacksAllUsers(await mapItemUsers, 0);
        return this.poeDivinationCardService.sortByCompletionDesc(allCards);
    }

    /**
     * Recupere la valeur du stash
     */
    async getTotalStashValue(user: string): Promise<number> {
        const items = this.getStashItems(user);
        const estimatedItems = this.poeItemService.estimateItems(await items);
        return this.poeItemService.getItemsValueInChaos(await estimatedItems);
    }
}
