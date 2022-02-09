import { Listener } from "discord-akairo";
import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { InviteTrack } from "../../model/index";


export default class GuildMemberAdd extends Listener {
    public constructor() {
        super("guildMemberAdd", {
            emitter: "client",
            event: "guildMemberAdd"
        });
    }

    public async exec(member: GuildMember): Promise<GuildMember | void> {
        if (member.user.bot) return;
        const data = await InviteTrack.findOne({ serverId: member.guild.id });
        if (!data) return;
        const InviteCache = this.client.inv.invite.get(member.guild.id) as any;
        const NewInvite = await member.guild.fetchInvites();
        this.client.inv.invite.set(member.guild.id, NewInvite as any);
        const UsedInvite = NewInvite.find((inv: any) => InviteCache.get(inv.code).uses < inv.uses) as any;
        const MemberCreatedAt = member.user.createdAt as any;
        const FakeUser = (Date.now() - MemberCreatedAt) / (1000 * 60 * 60 * 24) <= 3;

        if (UsedInvite === member.guild.vanityURLCode as any) return console.log("Who is that?");
        if (!data.inviteTrack[UsedInvite.inviter.id]) {
            data.inviteTrack[UsedInvite.inviter.id] = {
                totalInvite: 0,
                totalInviteRegular: 0,
                totalInviteFakeAccount: 0,
                totalInviteLeave: 0
            };
            data.markModified("inviteTrack");
            await data.save();
        }

        if (UsedInvite.inviter) {
            data.inviteTrack[member.user.id] = {
                InviterId: UsedInvite.inviter.id,
                IsInviterFake: FakeUser
            };
            data.markModified("inviteTrack");
            await data.save();

            if (FakeUser) {
                data.inviteTrack[UsedInvite.inviter.id].totalInvite += 1;
                data.inviteTrack[UsedInvite.inviter.id].totalInviteFakeAccount += 1;
                data.markModified("inviteTrack");
                await data.save();
            } else {
                data.inviteTrack[UsedInvite.inviter.id].totalInvite += 1;
                data.inviteTrack[UsedInvite.inviter.id].totalInviteRegular += 1;
                data.markModified("inviteTrack");
                await data.save();
            }
        }

        const channel = this.client.channels.cache.get(data.WelcomeChannelId) as TextChannel | any;
        if (!channel) return;
        const text = await repl(data.WelcomeMessageId, { member });

        const Embed = new MessageEmbed()
            .setColor(this.client.color)
            .setDescription(text);
        return channel.send(Embed);

        async function repl(text: any, { member }: { member: GuildMember}): Promise<any> {
            return text
                .replace(/{member}/g, `${member.user.username}`)
                .replace(/{target}/g, `${UsedInvite.inviter}`)
                .replace(/{total}/g, `${data?.inviteTrack[UsedInvite.inviter.id].totalInvite}`)
                .replace(/{regular}/g, `${data?.inviteTrack[UsedInvite.inviter.id].totalInviteRegular}`)
                .replace(/{fakecount}/, `${data?.inviteTrack[UsedInvite.inviter.id].totalInviteFakeAccount}`)
                .replace(/{invite}/g, `${UsedInvite && UsedInvite.code !== undefined ? UsedInvite.code : "what is that?"}`)
                .replace(/{fake}/g, `${FakeUser ? "Yes" : "No"}`);
        }
    }
}
