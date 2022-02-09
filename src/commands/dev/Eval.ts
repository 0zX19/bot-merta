/* eslint-disable radix */
/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Command } from "discord-akairo";
import { inspect } from "util";
import { Message } from "discord.js";
import { request } from "https";

const emoji = "🗑️";

export default class EvalCommand extends Command {
    public constructor() {
        super("eval", {
            aliases: ["eval", "e"],
            category: "developer",
            ownerOnly: true,
            clientPermissions: [],
            userPermissions: [],
            args: [{
                id: "code",
                match: "content"
            }],
            description: {
                content: "Evaluates code.",
                usage: "<code>"
            }
        });
    }

    public async exec(message: Message, { code }: { code: string }): Promise<Message | void> {
        const msg = message;
        const bot = this.client;
        const client = this.client;
        if (!code) return msg.channel.send("No code provided!");
        const { args, flags } = this.parseQuery(code);
        try {
            if (args.length < 1) return;
            let parsed = args.join(" ");
            let depth: any = 0;
            if (flags.includes("async")) {
                parsed = `(async() =>  {${parsed}} )()`;
            }

            if (flags.some((x: any) => x.includes("depth"))) {
                depth = flags.find((x: any) => x.includes("depth")).split("=")[1];
                depth = parseInt(depth, 10);
            }

            // eslint-disable-next-line prefer-const
            let { evaled, type } = await this.parseEval(eval(parsed));
            if (flags.includes("silent")) return;

            if (typeof evaled !== "string") { evaled = inspect(evaled, { depth }); }
            evaled = evaled
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@​/g, `@​${String.fromCharCode(8203)}`);
            evaled = evaled.replace(new RegExp(this.client.token!, "g"), "[ばかやろ！！！]");
            if (evaled.length > 2048) { evaled = await this.hastebin(evaled); } else { evaled = `\`\`\`js\n${evaled}\`\`\``; }
            const embed = this.client.util.embed()
                .setAuthor("📥 OUTPUT")
                .setColor("RANDOM")
                .setDescription(evaled)
                .addField("\u200b", `\`\`\`${type}\`\`\``);
            const m = await msg.channel.send(embed);
            await m.react(emoji);
            const filter = (rect: any, usr: any): boolean => emoji === rect.emoji.id && usr.id === message.author.id;
            m.createReactionCollector(filter, { time: 60000, max: 1 }).on("collect", () => { void m.delete(); });
        } catch (e) {
            console.error(e.stack);
            const embed = this.client.util.embed()
                .setColor("RED")
                .setAuthor("🚫 ERROR")
                .setDescription(`\`\`\`${e}\`\`\``);
            const m = await msg.channel.send(embed);
            await m.react(emoji);
            const filter = (rect: any, usr: any): boolean => emoji === rect.emoji.id && usr.id === message.author.id;
            m.createReactionCollector(filter, { time: 60000, max: 1 }).on("collect", () => { void m.delete(); });
        }
    }

    private hastebin(text: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = request({ hostname: "tk-bin.glitch.me", path: "/documents", method: "POST", minVersion: "TLSv1.3" }, res => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(`https://tk-bin.glitch.me/${JSON.parse(raw).key}`);
                    return reject(
                        new Error(`[hastebin] Error while trying to send data to https://tk-bin.glitch.me/documents,` +
                            `${res.statusCode?.toString() as string} ${res.statusMessage?.toString() as string}`)
                    );
                });
            }).on("error", reject);
            req.write(typeof text === "object" ? JSON.stringify(text, null, 2) : text);
            req.end();
        });
    }

    private clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.TOKEN!, "g"), "[REDACTED]")
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`);
        } return text;
    }

    private parseQuery(queries: string): any {
        const args = [];
        const flags = [];
        for (const query of queries.split(" ")) {
            if (query.startsWith("--")) flags.push(query.slice(2).toLowerCase());
            else args.push(query);
        }
        return {
            args,
            flags
        };
    }

    private async parseEval(input: any): Promise<any> {
        const isPromise: boolean =
            input instanceof Promise &&
            typeof input.then === "function" &&
            typeof input.catch === "function";
        if (isPromise) {
            input = await input;
            return {
                evaled: input,
                type: `Promise<${this.parseType(input)}>`
            };
        }
        return {
            evaled: input,
            type: this.parseType(input)
        };
    }

    private parseType(input: any): string {
        if (input instanceof Buffer) {
            let length = Math.round(input.length / 1024 / 1024);
            let ic = "MB";
            if (!length) {
                length = Math.round(input.length / 1024);
                ic = "KB";
            }
            if (!length) {
                length = Math.round(input.length);
                ic = "Bytes";
            }
            return `Buffer (${length} ${ic})`;
        }
        return input === null || input === undefined
            ? "Void"
            : input.constructor.name;
    }
}
