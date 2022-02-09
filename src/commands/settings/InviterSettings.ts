import { client } from "../..";
import { Command } from "discord-akairo";
import { Message, MessageEmbed, Collection } from "discord.js";
import { InviteTrack } from "../../model";

export default class InivteTrackSettings extends Command {
    public constructor() {
        super("invite-settings", {
            aliases: ["invite-settings", "is"],
            category: "Settings",
            ratelimit: 3,
            channel: "guild",
            userPermissions: ["MANAGE_CHANNELS", "MANAGE_GUILD"],
            ignorePermissions: client.ownerID
        });
    }

    public async exec(message: Message): Promise<Message | void> {
        let db = await InviteTrack.findOne({ serverId: message.guild!.id });
        if (!db) db = new InviteTrack({ serverId: message.guild!.id });

        const choice = [
            "Settings Welcome Channel",
            "Settings Goodbye Channel",
            "Settings Welcome Message",
            "Settings Goodbye Message"
        ];
        const filter = (m: Message) => m.author.id === message.author.id && /^(\d+|cancel|[1-2])$/i.test(m.content);
        const choices = choice.map((x: string, index: number) => `${index + 1} ${x}`);
        let collection: Collection<string, Message>;

        const Embed = new MessageEmbed()
            .setColor(this.client.color)
            .setAuthor("Welcome!")
            .setDescription([
                `This is inviter settings stage!`,
                `You can settings channel and welcome message for inviter here`,
                `How? First think first, you need to settings where the bot should send the inviter message`,
                `Select 1 and tag the channel`,
                `How to setting message? after you settings the channel, you can customize the message`,
                `Select 2 and then type the message`,
                `\u200b`,
                `{member} for tag who join the server`,
                `{target} who invite this poeple`,
                `{total} inviter total`,
                `{regular} total regular it's mean non fake account`,
                `{fakecount} total fake account this user invite`,
                `{invite} this is when the user join with vanilityURL like \`discord.gg/gg\``,
                `{fake} is this fake account or not, it'll say \`True\` and \`False\``,
                `\u200b`,
                `${choices.join("\n")}`
            ]);
        const msg = await message.channel.send(Embed);

        try {
            collection = await msg.channel.awaitMessages(filter, { max: 1, time: 130000, errors: ["time"] });
        } catch (err) {
            return message.channel.send("Time is up! You can run tis command again!");
        }

        const res = collection.first()?.content;
        collection.first()?.delete;

        if (res?.toLowerCase() === "cancel") {
            msg.delete();
            return message.reply("Cancelling the selection!").then(x => x.delete({ timeout: 5000 }));
        } else if (res?.toLowerCase() === "1") {
            const filter = (m: Message) => m.author.id === message.author.id;
            let collection: Collection<string, Message>;

            Embed.setDescription([
                `Now, please tag the channel where should i send the message`
            ]);
            msg.edit(Embed);

            try {
                collection = await msg.channel.awaitMessages(filter, { max: 1, time: 130000, errors: ["time"] });
            } catch (err) {
                return message.channel.send(`Time is up! You can run this command again!`);
            }

            const res = collection.first();
            const result = res?.mentions.channels.first() ? res.mentions.channels.first()?.id : res?.content as any;
            db.WelcomeChannelId = result;
            await db.save();

            Embed.setAuthor("Successfully!");
            Embed.setDescription([
                `Successfully setting channel to <#${db.WelcomeChannelId}>`
            ]);
            return msg.edit(Embed);
        } else if (res?.toLowerCase() === "2") {
            const filter = (m: Message) => m.author.id === message.author.id;
            let collection: Collection<string, Message>;

            Embed.setDescription([
                `Now, please tag the channel where should i send the message`
            ]);
            msg.edit(Embed);

            try {
                collection = await msg.channel.awaitMessages(filter, { max: 1, time: 130000, errors: ["time"] });
            } catch (err) {
                return message.channel.send(`Time is up! You can run this command again!`);
            }

            const res = collection.first();
            const result = res?.mentions.channels.first() ? res.mentions.channels.first()?.id : res?.content as any;
            db.GoodByeChannelId = result;
            await db.save();

            Embed.setAuthor("Successfully!");
            Embed.setDescription([
                `Successfully setting channel to <#${db.GoodByeChannelId}>`
            ]);
            return msg.edit(Embed);
        } else if (res?.toLowerCase() === "3") {
            const filter = (m: Message) => m.author.id === message.author.id;
            let collection: Collection<string, Message>;

            Embed.setDescription([
                `Hi! Now, please type the message should i say on the welcome channel`,
                `The default message is \`**{member}** is joined the server using **{target}** invitation\``,
                `\u200b`,
                `{member} for tag who join the server`,
                `{target} who invite this poeple`,
                `{total} inviter total`,
                `{regular} total regular it's mean non fake account`,
                `{fakecount} total fake account this user invite`,
                `{invite} this is when the user join with vanilityURL like \`discord.gg/gg\``,
                `{fake} is this fake account or not, it'll say \`True\` and \`False\``
            ]);
            msg.edit(Embed);

            try {
                collection = await msg.channel.awaitMessages(filter, { max: 1, time: 130000, errors: ["time"] });
            } catch (err) {
                return message.channel.send(`Time is up! You can run this command again!`);
            }

            const res = collection.first()?.content as string;
            db.WelcomeMessageId = res;
            await db.save();
            collection.first()?.delete();

            Embed.setAuthor(`Successfully!`);
            Embed.setDescription([
                `Sucessfully setting the welcome message to:`,
                `\u200b`,
                `\`\`\`${db.WelcomeMessageId}\`\`\``
            ]);
            return msg.edit(Embed);
        } else if (res?.toLowerCase() === "4") {
            const filter = (m: Message) => m.author.id === message.author.id;
            let collection: Collection<string, Message>;

            Embed.setDescription([
                `Hi! Now, please type the message should i say on the welcome channel`,
                `The default message is \`**{member}** leave the server using **{target}** invitation\``,
                `\u200b`,
                `{member} for tag who join the server`,
                `{target} who invite this poeple`,
                `{total} inviter total`,
                `{regular} total regular it's mean non fake account`,
                `{fakecount} total fake account this user invite`,
                `{fake} is this fake account or not, it'll say \`True\` and \`False\``
            ]);
            msg.edit(Embed);

            try {
                collection = await msg.channel.awaitMessages(filter, { max: 1, time: 130000, errors: ["time"] });
            } catch (err) {
                return message.channel.send(`Time is up! You can run this command again!`);
            }

            const res = collection.first()?.content as string;
            db.GoodByeMessageId = res;
            await db.save();
            collection.first()?.delete();

            Embed.setAuthor(`Successfully!`);
            Embed.setDescription([
                `Sucessfully setting the welcome message to:`,
                `\u200b`,
                `\`\`\`${db.GoodByeMessageId}\`\`\``
            ]);
            return msg.edit(Embed);
        }
    }
}
