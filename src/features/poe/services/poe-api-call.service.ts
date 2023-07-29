import http from "axios";
import { injectable, inject } from "inversify";
import {
    PoeApiGetCharactersRequest,
    PoeApiGetCharactersResponse,
    PoeApiGetLeaguesRequest,
    PoeApiGetLeaguesResponse,
    PoeNinjaGetCurrencyOverviewResponse,
    PoeNinjaGetCurrencyOverviewRequest,
    PoeApiGetStashItemsRequest,
    PoeApiGetStashItemsResponse,
    PoeNinjaGetItemOverviewRequest,
    PoeNinjaGetItemOverviewResponse,
} from "../models";
import { PoeUrls } from "../constants";
import { PoeUserService } from ".";
import { TYPES } from "../../../configuration";
import { LoggerUtils } from "../../../utils";

@injectable()
export class PoeApiCallService {
    private loggerUtils: LoggerUtils;
    private poeUserService: PoeUserService;

    constructor(
        @inject(TYPES.LoggerUtils) loggerUtils: LoggerUtils,
        @inject(TYPES.PoeUserService) poeUserService: PoeUserService,
    ) {
        this.loggerUtils = loggerUtils;
        this.poeUserService = poeUserService;

        // request
        http.interceptors.request.use((config) => {
            config.headers.setUserAgent("Axios mocbot/1.0.0 StrictMode");
            this.loggerUtils.logApiCall(config.url);
            return config;
        });

        // response
        http.interceptors.response.use(
            (config) => config,
            (error) => this.loggerUtils.logApiCallError(error),
        );
    }

    /**
     * Recupere les personnage d'un user
     *
     * @param req la requete
     */
    async getCharacters(req: PoeApiGetCharactersRequest): Promise<PoeApiGetCharactersResponse> {
        return http.get(PoeUrls.CHARACTERS_URL, {
            params: {
                accountName: req.accountName,
            },
        });
    }

    /**
     * Recupere le nom de la league
     *
     * @param req la requete
     */
    async getChallengeLeagues(req: PoeApiGetLeaguesRequest): Promise<PoeApiGetLeaguesResponse> {
        return http.get(PoeUrls.LEAGUE_URL, {
            params: {
                type: req.type,
            },
        });
    }

    /**
     * Recupere les currency rates
     *
     * @param req la requete
     */
    async getCurrencyOverview(req: PoeNinjaGetCurrencyOverviewRequest): Promise<PoeNinjaGetCurrencyOverviewResponse> {
        return http.get(PoeUrls.CURRENCY_OVERVIEW_URL, {
            params: {
                type: req.type,
                league: req.league,
            },
        });
    }

    /**
     * Recupere les currency rates
     *
     * @param req la requete
     */
    async getItemOverview(req: PoeNinjaGetItemOverviewRequest): Promise<PoeNinjaGetItemOverviewResponse> {
        return http.get(PoeUrls.ITEM_OVERVIEW_URL, {
            params: {
                type: req.type,
                league: req.league,
            },
        });
    }

    /**
     * Recupere le stash
     *
     * @param req la requete
     */
    async getStashItems(req: PoeApiGetStashItemsRequest): Promise<PoeApiGetStashItemsResponse> {
        await this.delay(1500);
        return http.get(PoeUrls.STASH_ITEMS_URL, {
            headers: { Cookie: `POESESSID=${this.poeUserService.getPoeUserFromPoeAccount(req.accountName).token};` },
            params: {
                accountName: req.accountName,
                realm: req.realm,
                league: req.league,
                tabs: req.tabs,
                tabIndex: req.tabIndex,
                public: req.public,
            },
        });
    }

    /**
     * attends un temps durée
     *
     * @param time le temps max
     */
    async delay(time: number): Promise<void> {
        // on attends 5 secondes
        await new Promise((res) => setTimeout(res, time));
    }
}
