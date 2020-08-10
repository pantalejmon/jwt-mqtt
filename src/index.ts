import auth from 'keycloak-authenticate'
import * as mqtt from 'async-mqtt'
import * as jwt from 'jwt-simple'
import {AsyncMqttClient} from "async-mqtt";

export async function authorize(urlKeycloak: string, user: string, password: string, realm: string, urlMqtt: string): Promise<AsyncMqttClient> {
    const token1 = await auth({
        url: urlKeycloak,
        username: user,
        password: password,
        realm: realm,
    });
    let token2 = jwt.decode(token1, '', true)
    console.log(token2)
    const client = mqtt.connect(urlMqtt, {clientId: token2.sub})
    await client.publish('token_exchange', token1)
    return client;
}
