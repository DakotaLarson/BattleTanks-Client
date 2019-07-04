import { AudioBuffer, AudioListener, AudioLoader, PositionalAudio } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import IPlayerObj from "../../interfaces/IPlayerObj";
import Options from "../../Options";

export default class EngineAudioHandler extends ChildComponent {

    private static MAX_PLAYER_SPEED = 4;

    private players: IPlayerObj[];

    private engineAudioBuffer: AudioBuffer | undefined;
    private audioListener: AudioListener;

    constructor(audioLoader: AudioLoader, audioListener: AudioListener, extension: string) {
        super();

        this.audioListener = audioListener;
        this.players = [];

        // @ts-ignore ignore additional arguments
        audioLoader.load(location.pathname + "res/audio/effects/game/engine" + extension, (buffer: AudioBuffer) => {
            this.engineAudioBuffer = buffer;
        });
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUDIO_ENABLED, this.onAudioEnabled);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_DISABLED, this.onAudioDisabled);
        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
        EventHandler.addListener(this, EventHandler.Event.DOM_VISIBILITYCHANGE, this.onVisibilityChange);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.AUDIO_ENABLED, this.onAudioEnabled);
        EventHandler.removeListener(this, EventHandler.Event.AUDIO_DISABLED, this.onAudioDisabled);
        EventHandler.removeListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
        EventHandler.removeListener(this, EventHandler.Event.DOM_VISIBILITYCHANGE, this.onVisibilityChange);
    }

    public startEngineSound(player: IPlayerObj) {

        const volume = Options.options.engineVolume;
        const audio = new PositionalAudio(this.audioListener);

        audio.setVolume(volume);
        audio.setLoop(true);
        audio.setBuffer(this.engineAudioBuffer as AudioBuffer);
        audio.setPlaybackRate(this.getPlaybackRate(player.movementVelocity));

        const enabled = Globals.getGlobal(Globals.Global.AUDIO_ENABLED) && !document.hidden;
        player.head.add(audio);
        audio.play();
        if (!enabled) {
            audio.pause();
        }
        player.engineAudio = audio;

        this.players.push(player);
    }

    public updateEngineSound(player: IPlayerObj) {
        (player.engineAudio as PositionalAudio).setPlaybackRate(this.getPlaybackRate(player.movementVelocity));
    }

    public stopEngineSound(player: IPlayerObj) {
        if (player.engineAudio) {
            player.engineAudio.stop();
            player.head.remove(player.engineAudio);
        }

        this.players.splice(this.players.indexOf(player), 1);
    }

    private onAudioEnabled() {
        for (const player of this.players) {
            if (player.engineAudio) {
                player.engineAudio.play();
            }
        }
    }

    private onAudioDisabled() {
        for (const player of this.players) {
            if (player.engineAudio) {
                player.engineAudio.stop();
            }
        }
    }

    private onOptionsUpdate(event: any) {
        if (event.attribute === "engineVolume") {
            for (const player of this.players) {
                (player.engineAudio as PositionalAudio).setVolume(event.data);
            }
        }
    }

    private onVisibilityChange() {
        const enabled = Globals.getGlobal(Globals.Global.AUDIO_ENABLED);
        if (enabled) {
            if (document.hidden) {
                this.onAudioDisabled();
            } else {
                this.onAudioEnabled();
            }
        }
    }

    private getPlaybackRate(speed: number) {
        const increase = Math.abs(speed) / EngineAudioHandler.MAX_PLAYER_SPEED / 2;
        return 1 + increase;
    }
}
