import {Broker} from "./broker";
import {KeycloakConfig} from "./keycloakConfig";
import * as fs from "fs";

const config: KeycloakConfig = {
    "realm": "mqtt",
    "auth-server-url": "http://192.168.178.42:8080",
    "client_id": "your client name",
    "client_secret": "c88a2c21-9d1a-4f83-a18d-66d75c4d8020",
    "username": "admin",
    "password": "admin"
};


const broker = new Broker(1883, config);


