import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Player } from './player.entity';
@WebSocketGateway({ cors: '*:*' })
export class DomblockGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server;
    users: number = 0;
    sessionID: string = '';
    playerList: any[] = new Array();

    async handleConnection(client) {
        console.info('Client connected : ', client.id);
        // A client has connected
        this.users++;

        let player: Player = new Player();
        player.surname = client.id;
        player.status = 'connected';
        player.data = {
            goal: '',
            score: 0,
            level: 0,
            numbloc: 0
        };
        this.playerList[client.id] = {
            'player' : player
        }
        // Notify connected clients of current users
        this.server.emit('userlist', this.playerList);
    }

    async handleDisconnect(client) {
        console.info('Client disconnected : ', client.id);
        // A client has disconnected
        this.users--;
        // Notify connected clients of current users
        delete this.playerList[client.id];
        // this.socketList.remove(client.id);
        this.server.emit('userlist', this.playerList);
    }
    
    @SubscribeMessage('message')
    async onMessage(client, message: string) {
        let reqClient = JSON.parse(message);
        console.debug('client: ', client.id);
        console.debug('reqClient: ', reqClient);
        console.log("[message] Action: " + reqClient.action + " - from client " + client.id);
        //console.log(socket);
        switch (reqClient.action) {

            case 'userlist':
                console.log("[message][userlist] Send list to client: " + client.id);
                this.server.emit('message', JSON.stringify({
                    action: "userlist",
                    param: this.getSurnameList()
                }));
                break;
            case 'hit':
                this.playerList[client.id]['player'].data = reqClient.param;
                console.log("[message][hit] size playerList: " + this.playerList[client.id].length);
                console.log("[message][hit] clientId " + client.id + ": " +
                    "[# of bloc=" + this.playerList[client.id]['player'].data.numbloc + "] " +
                    "[Level=" + this.playerList[client.id]['player'].data.level + "] " +
                    "[Score=" + this.playerList[client.id]['player'].data.score + "] " +
                    "[Goal=" + this.playerList[client.id]['player'].data.goal + "]");
                console.log("[message][hit] Broadcast these data");
                console.log(this.playerList[client.id]['player'].data);

                client.broadcast.emit('message', JSON.stringify({
                    action: 'bchit',
                    param: {
                        'numbloc': reqClient.param.numbloc
                    }
                }));

                //socket.io.emit('this', reqClient.param);
                reqClient = null;
                break;

            default:
                console.log("[message][default] Action is '" + reqClient.action + "' is not defined");
                break;
        }
    }

    /**
     * 
     * @returns 
     */
    getSurnameList() : string[] {
        let userListSurname: string[] = new Array<string>();
        for (let clientId in this.playerList) {
            if (this.playerList[clientId]['player'].status === "connected") {
                console.log("[message] name: " + clientId + " surname: " + this.playerList[clientId]['player'].surname);
                userListSurname.push(this.playerList[clientId]['player'].surname);
            }
        }
        return userListSurname;
    }
}
