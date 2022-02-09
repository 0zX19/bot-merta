import { Client } from "./structures/Client";
import { owner, token } from "./config";

export const client: Client = new Client({
    owners: owner,
    token
});

void client.start();
