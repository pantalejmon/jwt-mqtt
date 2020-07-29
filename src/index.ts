import auth from 'keycloak-authenticate'
import * as mqtt from 'async-mqtt'
const keycloak = require('keycloak-backend')({
    "realm": "mqtt",
    "auth-server-url": "http://192.168.178.42:8080",
    "client_id": "your client name",
    "username": "admin",
    "password": "admin"
});

async function main() {

    const token1 = await auth({
        url: 'http://192.168.178.42:8080',
        username: 'test',
        password: 'test',
        realm: 'mqtt',
    });

    const data = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    let token2 = await keycloak.jwt.verify(token1);
    console.log(token2.content.sub);
    console.log(token2.content.realm_access.roles);
    const client = mqtt.connect('http://192.168.178.42:1883', {clientId: token2.content.sub})
    await  client.publish('token_exchange', token1)


    // setTimeout(async ()=> {
    //     await  client.publish('topic1', 'topic1')
    //     await  client.publish('topic3', 'topic3')
    // }, 5000)



    setTimeout( ()=> {
        console.time("test")
        for (let i = 0; i < 100000; i++) {
            client.publish('topic1', data);
        }
        console.timeEnd("test")
    },5000)

}

main();
