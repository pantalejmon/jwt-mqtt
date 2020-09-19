import {Client} from "aedes";

export interface ClientToken {
    client: Client;
    token: string;
    topics: Array<string>;
}
