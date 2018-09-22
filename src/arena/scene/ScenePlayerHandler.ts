import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import { Mesh, MeshLambertMaterial, DoubleSide, CylinderGeometry, BoxGeometry, Vector3, Scene, Geometry, AudioListener, AudioLoader, PositionalAudio, AudioBuffer } from "three";

type PlayerObj = {
    body: Mesh,
    head: Mesh,
};

export default class ScenePlayerHandler extends Component{
    
    scene: Scene;
    players: Map<number, PlayerObj>;

    playerBodyWidth: number;
    playerBodyHeight: number;
    playerBodyDepth: number;

    audioListener: AudioListener;

    shootSoundBuffer: AudioBuffer;
    invalidShootSoundBuffer: AudioBuffer;

    controlledPlayerId: number;

    playerOffset: Vector3;

    constructor(scene: Scene, audioListener: AudioListener){
        super();
        this.players = new Map();
        
        this.scene = scene;

        this.audioListener = audioListener;

        let audioLoader = new AudioLoader();
        audioLoader.load('audio/shoot.wav', (buffer: AudioBuffer) => {
            this.shootSoundBuffer = buffer;
        }, undefined, undefined);
        audioLoader.load('audio/shoot-invalid.wav', (buffer: AudioBuffer) => {
            this.invalidShootSoundBuffer = buffer;
        }, undefined, undefined);

        this.playerBodyWidth = 1;
        this.playerBodyHeight = 0.55;
        this.playerBodyDepth = 1.5;

        this.controlledPlayerId = -1;

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
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT_INVALID, this.onShootInvalid);

    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerJoin);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT, this.onShoot);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT_INVALID, this.onShootInvalid);
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
            if(this.controlledPlayerId === id){
                this.controlledPlayerId = -1;
            }
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
            head: headMesh,
        }

        this.players.set(id, playerObj);
        
        if(!isConnectedPlayer){
            this.controlledPlayerId = id;
        }
    }

    onShoot(playerId: number){
        if(this.players.has(playerId)){
            let head = this.players.get(playerId).head;
            
            let audio = new PositionalAudio(this.audioListener);
        
            head.add(audio);

            audio.onEnded = () => {
                audio.isPlaying = false;
                head.remove(audio);
            }

            audio.setBuffer(this.shootSoundBuffer);
            audio.play();
        }
    }

    onShootInvalid(){
        if(this.controlledPlayerId > -1){
            if(this.players.has(this.controlledPlayerId)){
                let head = this.players.get(this.controlledPlayerId).head;
            
            let audio = new PositionalAudio(this.audioListener);
        
            head.add(audio);

            audio.onEnded = () => {
                audio.isPlaying = false;
                head.remove(audio);
            }
            
            audio.setBuffer(this.invalidShootSoundBuffer);
            audio.play();
            }
        }
    }
}