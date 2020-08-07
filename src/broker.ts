import aedes, {Aedes, AedesPublishPacket, Client, Subscription} from 'aedes';
import net from 'net';
import {ClientToken} from "./clientToken";
import {KeycloakConfig} from "./keycloakConfig";


export class Broker {
    private CONFIG_TOPIC = 'token_exchange';
    private server;
    private aedes: Aedes = aedes({
        authorizeForward: this.forwardHandler.bind(this),
        authorizePublish: this.checkToken.bind(this)
    });
    private keycloak;
    private tokens: Array<ClientToken> = [];

    constructor(port: number, config: KeycloakConfig) {
        this.keycloak = require('keycloak-backend')(config);
        this.server = net.createServer(this.aedes.handle);
        this.server.listen(port, () => console.log(`[INFO] JWT-MQTT server starts on port: ${port}`));
    }

    async checkToken(client: Client, data: AedesPublishPacket, callback) {
        if (client && data.topic === this.CONFIG_TOPIC) {
            const token: string = <string>data.payload.toString();
            const recognizedToken: any = await this.keycloak.jwt.verify(token);
            if (recognizedToken.content.sub === client.id) this.tokens.push({
                client,
                token,
                topics: recognizedToken.content.realm_access.roles
            })
        } else if (client && data.topic !== this.CONFIG_TOPIC) {
            try {
                if (this.checkPublish(data.topic, this.findTopics(client))) {
                    callback();
                } else {
                    console.log('[INFO] Permision denied client: ' + client.id + ' topic: ' + data.topic);
                }
            } catch {
                console.log('[INFO] Invalid token from clientId: ' + client.id + ' data: ' + data.payload);
            }
        } else {
            callback;
        }
    }

    /**
     * Message forwarder
     * @param client - target client
     * @param data   - mqtt packet
     */
    forwardHandler(client: Client, data: AedesPublishPacket) {
        if (data.topic !== this.CONFIG_TOPIC) {
            if (this.checkSubscribe(data.topic, this.findTopics(client))) {
                return data;
            }
        }
    }

    /**
     * Method to reload new subscribtion
     * param sub
     * param client
     */

    checkPublish(topic: string, topics: Array<string>) {
        if (topics) {
            for (const tpc of topics) {
                if (tpc === topic + '_p') {
                    return true;
                }
            }
        }
        return false;
    }

    checkSubscribe(topic: string, topics: Array<string>) {
        if (topics) {
            for (const tpc of topics) {
                if (tpc === topic + '_s') {
                    return true;
                }
            }
        }
        return false;
    }

    findTopics(client: Client) {
        for (const c of this.tokens) {
            if (c.client === client) {
                return c.topics;
            }
        }
    }
}
