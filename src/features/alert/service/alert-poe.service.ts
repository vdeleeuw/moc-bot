import { TextBasedChannel } from "discord.js";
import { injectable } from "inversify";

@injectable()
export class AlertPoeService {
    private deathAlertChannel: TextBasedChannel;

    constructor() {}

    setDeathAlertChannel(channel: TextBasedChannel): void {
        this.deathAlertChannel = channel;
    }

    getDeathAlertChannel(): TextBasedChannel {
        return this.deathAlertChannel;
    }
}
