import { client } from "../..";
import { Listener } from "discord-akairo";

export default class ReadyEvent extends Listener {
    public constructor() {
        super("ready", {
            emitter: "client",
            event: "ready"
        });
    }

    public async exec(): Promise<void> {
        this.client.logger.info(`${this.client.user!.tag} Ready!`);
        await this.client.user?.setActivity(`finding ᵃᵉˢ | mer.`, { type: "COMPETING" });
        await this.client.music.init(this.client.user!.id);

        this.client.guilds.cache.forEach(async (guild): Promise<void | any> => {
            if (!guild.me?.hasPermission(["MANAGE_GUILD", "MANAGE_CHANNELS"])) return console.log(`Missing Permission at: ${guild.name} ( ${guild.id} )`);
            const inv = await guild.fetchInvites();
            const invites = client.inv.invite = new Map();
            if (guild.vanityURLCode) inv.set(guild.vanityURLCode, await guild.fetchVanityData() as any);
            return invites.set(guild.id, inv as any);
        });
    }
}
