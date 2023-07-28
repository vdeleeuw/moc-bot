import { injectable } from "inversify";
import { PoeUser } from "../models";

@injectable()
export class PoeUserService {
    private poeUsers: Array<PoeUser>;

    constructor() {
        this.poeUsers = [];
    }

    /**
     * clear les tokens
     */
    clearPoeUsers(): void {
        this.poeUsers = [];
    }

    /**
     * recupère mon token (si c'est moi)
     * (il faut que la clef de l'enum soit la meme)
     *
     * @param discordTag le user tag discord
     */
    getPoeUsers(): PoeUser[] {
        return this.poeUsers;
    }

    /**
     * recupère mon token (si c'est moi)
     * (il faut que la clef de l'enum soit la meme)
     *
     * @param discordTag le user tag discord
     */
    getPoeUserFromDiscordTag(discordTag: string): PoeUser {
        return this.poeUsers.find((x) => x.discordTag === discordTag);
    }

    /**
     * retourne le token d'un compte
     *
     * @param poeAccount le compte poe
     */
    getPoeUserFromPoeAccount(poeAccount: string): PoeUser {
        return this.poeUsers.find((x) => x.accountName === poeAccount);
    }

    /**
     * Sauvegarde un token
     *
     * @param discordTag le compte discord qui veut save un token
     * @param poeAccount le compte poe du token
     * @param token le token
     */
    saveToken(discordTag: string, poeAccount: string, token: string): boolean {
        if (poeAccount && token) {
            this.poeUsers.push({ discordTag, accountName: poeAccount?.toLowerCase(), token });
            return true;
        }
        return false;
    }
}
