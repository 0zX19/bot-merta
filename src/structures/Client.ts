import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";
import { Intents, MessageEmbed } from "discord.js";
import { join } from "path";
import { Logger } from "@ayanaware/logger";
import { IClientConfig } from "../typings";
import { RedisClient } from "./RedisClient";
import { Manager } from "erela.js";
import Erela from "./ErelaClient";
import MongoDB from "./MongoClient";

declare module "discord-akairo" {
    interface AkairoClient {
        logger: Logger;
        cache: { inviteTrack: RedisClient };
        music: Manager;
        erela: Erela;
        inv: { invite: Map<string, string> };
        mongo: MongoDB;
        color: string;
    }
}

export class Client extends AkairoClient {
    public cache = {
        inviteTrack: new RedisClient({ db: 0 })
    };

    public inv = {
        invite: new Map()
    };


    public readonly commandHandler = new CommandHandler(this, {
        directory: join(__dirname, "..", "commands"),
        allowMention: true,
        prefix: "s.",
        blockBots: true,
        blockClient: true,
        commandUtil: true,
        handleEdits: true,
        argumentDefaults: {
            prompt: {
                modifyStart: (msg, text) => new MessageEmbed()
                    .setColor(`RED`)
                    .setDescription(`${text} Type \`cancel\` to cancel the command`),
                modifyRetry: (msg, text) => new MessageEmbed()
                    .setColor(`RED`)
                    .setDescription(`${text} Type \`cancel\` to cancel the command`),
                timeout: new MessageEmbed()
                    .setColor("RED")
                    .setDescription(`You took to long, the command has been cancelled.`),
                ended: new MessageEmbed()
                    .setColor(`RED`)
                    .setDescription(`You exceeded the maximum amout of trie, this command has now been cancelled.`),
                cancel: new MessageEmbed()
                    .setColor(`RED`)
                    .setDescription(`This command has been cancelled.`),
                retries: 3,
                time: 30000
            },
            otherwise: ""
        },
        aliasReplacement: /-/g,
        automateCategories: true,
        ignoreCooldown: this.ownerID,
        ignorePermissions: this.ownerID,
        defaultCooldown: 15e3
    });

    public readonly listenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, "..", "listeners")
    });

    public constructor(public config: IClientConfig) {
        super({
            ownerID: config.owners,
            allowedMentions: { parse: ["users", "roles"] },
            fetchAllMembers: false,
            messageCacheLifetime: 1800,
            messageCacheMaxSize: Infinity,
            messageEditHistoryMaxSize: Infinity,
            messageSweepInterval: 300,
            restTimeOffset: 300,
            retryLimit: 3,
            ws: {
                intents: [Intents.ALL]
            }
        });
        this.logger = Logger.get(Client);
        this.erela = new Erela();
        this.mongo = new MongoDB();
        this.color = "BLACK";
    }

    public async init(): Promise<void> {
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            CommandHandler: this.commandHandler,
            WebSocket: this.ws,
            process
        });
        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
    }

    public async start(): Promise<void> {
        await this.init();
        await this.erela.connect();
        await this.mongo.dbConnect();
        await this.login(this.config.token);
    }
}
