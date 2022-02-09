import { Command } from "discord-akairo";
import { Message, MessageEmbed, GuildMember } from "discord.js";
const emj = ["⬅️", "➡️"];

export default class QueueCommand extends Command {
    public constructor() {
        super("queue", {
            aliases: ["queue", "q"],
            category: "Music",
            ratelimit: 3,
            channel: "guild"
        });
    }

    public async exec(message: Message): Promise<Message | void> {
        const player = this.client.music.players.get(message.guild!.id);
        if (!player) return message.channel.send(`There is not current music playing!`);

        let map = player.queue.map(track => `[${track.title}](${track.uri})`);
        const array = [];
        for (const m of map) { array.push(m); }
        map = await this.chunk(array);

        const x = map.length;
        const y = 1;
        const start = y * x;
        const end = start - x;
        const Embed = new MessageEmbed()
            .setDescription(array.slice(end, start));
        const msg = await message.channel.send(Embed);
        msg.react(emj[0]);
        msg.react(emj[1]);
        await this.page(msg, message.author, map);
    }

    public async page(message: Message, user: any, data: any, page = 0) {
        const filter = (x: any, i: GuildMember) => i.id === user.id && emj.includes(x.emoji.name);
        let res = await message.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] }) as any;
        if (!res) return message.reactions.removeAll();

        res = res.first();
        res.users.remove(user.id);
        const { name } = res.emoji;
        if (name === emj[0]) --page;
        if (name === emj[1]) ++page;

        page = page > data.length - 1 ? 0 : page < 0 ? data.length - 1 : page;

        const Embed = new MessageEmbed()
            .setColor(this.client.color)
            .setDescription(data[page])
            .setFooter(`Page ${page + 1}/${data.length}`);
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
