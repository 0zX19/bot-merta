import { Command } from "discord-akairo";
import { GuildMember, Message, MessageEmbed, Role, Collection, MessageReaction } from "discord.js";
const emj = ["⬅️", "➡️"];

export default class Inrole extends Command {
    public constructor() {
        super("inrole", {
            aliases: ["inrole"],
            category: "Information",
            ratelimit: 3,
            channel: "guild",
            args: [
                {
                    id: "role",
                    type: "role",
                    match: "rest",
                    prompt: {
                        modifyStart: (msg: Message) => `**${msg.author.tag}** | Please mention roles or give me the role id!`,
                        modifyRetry: (msg: Message) => `**${msg.author.tag}** | Please mention roles or give me the role id!`
                    }
                }
            ]
        });
    }

    public async exec(message: Message, { role }: { role: Role }): Promise<Message | void> {
        const rl = message.guild?.members.cache.filter(x => x.roles.cache.has(role.id));
        let map = rl?.map(x => ({ user: x.user.tag })) as any;
        const array = [];
        for (const m of map) { array.push(`**>** ${m.user} `); }
        map = await this.chunk(array);

        const x = 5;
        const y = 1;
        const start = y * x;
        const end = start - 5;
        const maxPage = Math.ceil(array.length / x);
        const Embed = new MessageEmbed()
            .setDescription(array.slice(end, start))
            .setFooter(`Page ${y > maxPage ? maxPage : y} of ${maxPage}`);
        const msg = await message.channel.send(Embed);
        msg.react(emj[0]);
        msg.react(emj[1]);
        await this.page(msg, message.author, map, y);
    }

    public async page(message: Message, user: any, data: any, page: number) {
        const filter = (x: any, i: GuildMember) => i.id === user.id && emj.includes(x.emoji.name);
        let res = await message.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] }) as Collection<string, MessageReaction> | any;
        if (!res) return message.reactions.removeAll();

        res = res.first();
        res.users.remove(user.id);
        const { name } = res.emoji;
        if (name === emj[0]) --page;
        if (name === emj[1]) ++page;

        page = page > data.length - 1 ? 0 : page < 0 ? data.length - 1 : page;

        const maxPage = Math.ceil(data.length / 5);
        const Embed = new MessageEmbed()
            .setColor(this.client.color)
            .setDescription(data[page])
            .setFooter(`Page ${page > maxPage ? maxPage : page} of ${maxPage}`);
        message.edit(Embed);
        this.page(message, user, data, page);
    }

    public async chunk(data: any, chunkSize = 5): Promise<any> {
        const temp = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            temp.push(data.slice(i, i + chunkSize));
        }
        return temp;
    }
}
