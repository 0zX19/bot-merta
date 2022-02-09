import { Listener } from "discord-akairo";
import { Guild } from "discord.js";
import { InviteTrack } from "../../model/index";


export default class GuildCreate extends Listener {
    public constructor() {
        super("GuildCreate", {
            emitter: "client",
            event: "guildCreate"
        });
    }

    public async exec(guild: Guild): Promise<void> {
        const cache = await this.client.cache.inviteTrack.get(guild.id);
        if (!cache) {
            let db = await InviteTrack.findOne({ serverId: guild.id });
            if (!db) db = new InviteTrack({ serverId: guild.id });
            await db.save();
            await this.client.cache.inviteTrack.set(db.serverId, db._id);
        }
    }
}
