import Component from "../../component/Component";
import EventHandler from "../../EventHandler";
import { Mesh, MeshLambertMaterial, DoubleSide, CylinderGeometry, BoxGeometry, Vector3, Scene, Geometry } from "three";

type PlayerObj = {
    body: Mesh,
    head: Mesh
};

export default class ScenePlayerHandler extends Component{
    
    scene: Scene;
    players: Map<number, PlayerObj>;

    playerBodyWidth: number;
    playerBodyHeight: number;
    playerBodyDepth: number;

    playerOffset: Vector3;

    constructor(scene: Scene){
        super();
        this.players = new Map();
        
        this.scene = scene;

        this.playerBodyWidth = 1;
        this.playerBodyHeight = 0.55;
        this.playerBodyDepth = 1.5;

        this.playerOffset = new Vector3(0.5, this.playerBodyHeight/2, 0.5);

    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerJoin);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT, this.onShoot);

    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerJoin);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT, this.onShoot);
    }

    clearPlayers(){
        let playerValues = this.players.values();
        let playerValue = playerValues.next();
        while(!playerValue.done){
            let playerObj = playerValue.value;
            this.scene.remove(playerObj.body, playerObj.head);

            playerValue = playerValues.next();
        }
    }

    onPlayerAddition(data){
        this.addPlayer(data.id, data.pos, false);
    }

    onConnectedPlayerJoin(data){
        this.addPlayer(data.id, data.pos, true);
    }

    onPlayerMove(data){
        if(this.players.has(data.id)){
            let playerObj = this.players.get(data.id);

            let body = playerObj.body;
            let head = playerObj.head;

            head.position.copy(data.pos).add(this.playerOffset);
            head.rotation.y = data.headRot;

            body.position.copy(data.pos).add(this.playerOffset);
            body.rotation.y = data.bodyRot;
        }       
    }

    removePlayer(id: number){
        if(this.players.has(id)){
            let obj = this.players.get(id);
            this.scene.remove(obj.body);
            this.scene.remove(obj.head)
            this.players.delete(id);
        }
    }

    addPlayer(id: number, pos: Vector3, isConnectedPlayer: boolean){
        let playerGeo = new Geometry();
        let playerHeadGeo = new Geometry();

        let bodyGeo = new BoxGeometry(this.playerBodyWidth, this.playerBodyHeight, this.playerBodyDepth);
        let headGeo = new BoxGeometry(0.5, 0.35, 0.5);
        let turretGeo = new CylinderGeometry(0.0625, 0.0625, 0.75, 8, 1, true);
        turretGeo.rotateX(Math.PI / 2);

        let bodyMaterial, headMaterial;
        if(isConnectedPlayer){
            bodyMaterial = new MeshLambertMaterial({
                color: 0xce141a
            });
    
            headMaterial = new MeshLambertMaterial({
                color: 0xce141a,
                side: DoubleSide
            });
    
        }else{
            bodyMaterial = new MeshLambertMaterial({
                color: 0x1ace14
            });
    
            headMaterial = new MeshLambertMaterial({
                color: 0x1ace14,
                side: DoubleSide
            });
    
        }
       
        let headOffset = new Vector3(0, this.playerBodyHeight / 2 + 0.35/2, 0);
        let turretOffset = new Vector3(0, this.playerBodyHeight / 2 + 0.35/2, 0.25); 

        for(let i = 0; i < headGeo.vertices.length; i ++){
            headGeo.vertices[i].add(headOffset);
        }
        for(let i = 0; i < turretGeo.vertices.length; i ++){
            turretGeo.vertices[i].add(turretOffset);
        }

        playerHeadGeo.merge(headGeo);
        playerHeadGeo.merge(turretGeo);

        playerGeo.merge(bodyGeo);

        let bodyMesh = new Mesh(playerGeo, bodyMaterial);
        bodyMesh.position.copy(pos).add(this.playerOffset);

        let headMesh = new Mesh(playerHeadGeo, headMaterial);
        headMesh.position.copy(pos).add(this.playerOffset);

        this.scene.add(bodyMesh, headMesh);

        let playerObj: PlayerObj = {
            body: bodyMesh,
            head: headMesh
        }

        this.players.set(id, playerObj);
    }

    onShoot(playerId: number){
        console.log(playerId + ' shoot');
        
    }
}