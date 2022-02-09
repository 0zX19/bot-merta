import { client } from "../..";
import { Listener } from "discord-akairo";
import { Invite } from "discord.js";

export default class InviteDelete extends Listener {
    public constructor() {
        super("InviteDelete", {
            emitter: "client",
            event: "inviteDelete"
        });
    }

    public async exec(invite: Invite) {
        const inv = await invite.guild?.fetchInvites();
        const invites = client.inv.invite = new Map();
        if (invite.guild?.vanityURLCode) inv?.set(invite.guild.vanityURLCode, await invite.guild.fetchVanityData() as any);
        return invites.set(invite.guild?.id as string, inv as any);
    }
}
