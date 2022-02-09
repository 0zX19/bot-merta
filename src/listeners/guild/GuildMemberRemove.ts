import { Listener } from "discord-akairo";
import { GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { InviteTrack } from "../../model/index";

export default class GuildMemberRemove extends Listener {
    public constructor() {
        super("guildMemberRemove", {
            emitter: "client",
            event: "guildMemberRemove"
        });
    }

    public async exec(member: GuildMember): Promise<void> {
        if (member.user.bot) return;
        const data = await InviteTrack.findOne({ serverId: member.guild.id });
        if (!data) return;
        const MemberCreatedAt = member.user.createdAt as any;
        const FakeUser = (Date.now() - MemberCreatedAt) / (1000 * 60 * 60 * 24) <= 3;

        const db = data.inviteTrack[member.id];
        if (db.IsInviterFake && db.InviterId) {
            data.inviteTrack[db.InviterId].totalInvite -= 1;
            data.inviteTrack[db.InviterId].totalInviteFakeAccount -= 1;
            data.markModified("inviteTrack");
            await data.save();
        } else if (db.InviterId) {
            data.inviteTrack[db.InviterId].totalInviteRegular -= 1;
            data.inviteTrack[db.InviterId].totalInvite -= 1;
            data.markModified("inviteTrack");
            await data.save();
        }

        data.inviteTrack[db.InviterId].totalInviteLeave += 1;
        data.markModified("inviteTrack");
        await data.save();

        const channel = this.client.channels.cache.get(data.GoodByeChannelId) as TextChannel | any;
        if (!channel) return;
        const text = await repl(data.GoodByeMessageId, { member });

        const Embed = new MessageEmbed()
            .setColor(this.client.color)
            .setDescription(text);
        return channel.send(Embed);

        async function repl(text: any, { member }: { member: GuildMember}): Promise<any> {
            const target = member.guild.members.cache.get(db.InviterId)?.user.id;
            return text
                .replace(/{member}/g, `${member.user.username}`)
                .replace(/{target}/g, `<@${target}>`)
                .replace(/{total}/g, `${data?.inviteTrack[db.InviterId].totalInvite}`)
                .replace(/{regular}/g, `${data?.inviteTrack[db.InviterId].totalInviteRegular}`)
                .replace(/{fakecount}/, `${data?.inviteTrack[db.InviterId].totalInviteFakeAccount}`)
                .replace(/{fake}/g, `${FakeUser ? "Yes" : "No"}`);
        }
    }
}
