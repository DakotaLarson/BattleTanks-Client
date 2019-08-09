import { AudioContext as ThreeAudioContext } from "three";
import Component from "../component/Component";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Options from "../Options";

enum State {
    MAIN_MENU,
    CONNECTION_MENU,
    SPECTATING,
    LIVE,
}

export default class BackgroundAudioHandler extends Component {

    private static readonly MAIN_MENU_A_AUDIO_SRC = "res/audio/music/main_menu_a";
    private static readonly MAIN_MENU_B_AUDIO_SRC = "res/audio/music/main_menu_b";
    private static readonly CONNECTION_MENU_AUDIO_SRC = "res/audio/music/connection_menu";
    private static readonly SPECTATING_AUDIO_SRC = "res/audio/music/spectating";
    private static readonly LIVE_AUDIO_SRC = "res/audio/music/live";

    private static readonly RECORDING_GAIN = 0.6;

    private audioContext: AudioContext;

    private gainNode: GainNode;
    private recordingGainNode: GainNode;

    private bufferSource: AudioBufferSourceNode | undefined;

    private state: State;

    private mainMenuAudioBuffer: AudioBuffer | undefined;
    private connectionMenuAudioBuffer: AudioBuffer | undefined;
    private spectatingAudioBuffer: AudioBuffer | undefined;
    private liveAudioBuffer: AudioBuffer | undefined;

    private playAudioOnLoad: boolean;

    private enabled: boolean;
    private useMP3: boolean;

    private playerLive: boolean;

    constructor(useMP3: boolean) {
        super();

        // @ts-ignore
        this.audioContext = ThreeAudioContext.getContext();
        this.useMP3 = useMP3;

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = Options.options.musicVolume;
        this.gainNode.connect(this.audioContext.destination);

        this.recordingGainNode = this.audioContext.createGain();
        this.recordingGainNode.gain.value = BackgroundAudioHandler.RECORDING_GAIN;

        this.state = State.MAIN_MENU;

        this.getAudioBuffers();

        this.playAudioOnLoad = true;
        this.enabled = false;
        this.playerLive = false;
    }

    // Enabled after MuteToggleHandler
    public enable() {
        if (this.audioContext.state === "suspended" && Globals.getGlobal(Globals.Global.AUDIO_ENABLED)) {
            EventHandler.callEvent(EventHandler.Event.AUDIO_FAILURE);
        }
        EventHandler.addListener(this, EventHandler.Event.AUDIO_ENABLED, this.onAudioEnabled);
        EventHandler.addListener(this, EventHandler.Event.AUDIO_DISABLED, this.onAudioDisabled);
        EventHandler.addListener(this, EventHandler.Event.BACKGROUND_AUDIO_MAIN_MENU, this.onAudioMainMenu);
        EventHandler.addListener(this, EventHandler.Event.BACKGROUND_AUDIO_CONNECTION_MENU, this.onAudioConnectionMenu);
        EventHandler.addListener(this, EventHandler.Event.BACKGROUND_AUDIO_SPECTATING, this.onAudioSpectating);
        EventHandler.addListener(this, EventHandler.Event.BACKGROUND_AUDIO_LIVE, this.onAudioLive);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);

        this.enabled = Globals.getGlobal(Globals.Global.AUDIO_ENABLED);
    }

    public getRecordingGainNode() {
        return this.recordingGainNode;
    }

    private onAudioEnabled() {
        this.enabled = true;
        switch (this.state) {
            case State.MAIN_MENU:
                this.onAudioMainMenu();
                break;
            case State.CONNECTION_MENU:
                this.onAudioConnectionMenu();
                break;
            case State.SPECTATING:
                this.onAudioSpectating();
                break;
            case State.LIVE:
                this.onAudioLive();
                break;
        }
    }

    private onAudioDisabled() {
        this.enabled = false;
        this.stopCurrentBufferSource();
    }

    private onAudioMainMenu() {
        this.onStateChange(State.MAIN_MENU, this.mainMenuAudioBuffer);
    }

    private onAudioConnectionMenu() {
        this.onStateChange(State.CONNECTION_MENU, this.connectionMenuAudioBuffer);
    }

    private onAudioSpectating() {
        this.onStateChange(State.SPECTATING, this.spectatingAudioBuffer);
    }

    private onAudioLive() {
        this.onStateChange(State.LIVE, this.liveAudioBuffer);
    }

    private onStateChange(state: State, buffer: AudioBuffer | undefined) {
        this.state = state;
        if (this.enabled) {
            if (buffer) {
                this.playAudioBuffer(buffer);
            } else {
                console.warn("Buffer not loaded!");
            }
        }
    }

    private onPlayerAddition() {
        this.playerLive = true;
        this.updateGain();
    }

    private onPlayerRemoval() {
        this.playerLive = false;
        this.updateGain();
    }

    private onOptionsUpdate(event: any) {
        if (event.attribute === "musicVolume") {
            this.updateGain(event.data);
        }
    }

    private updateGain(value?: number) {
        if (value === undefined) {
            value = Options.options.musicVolume as number;
        }
        if (this.playerLive) {
            this.gainNode.gain.value = value / 3;
            this.recordingGainNode.gain.value = BackgroundAudioHandler.RECORDING_GAIN / 3;
        } else {
            this.gainNode.gain.value = value;
            this.recordingGainNode.gain.value = BackgroundAudioHandler.RECORDING_GAIN;
        }
    }

    private getAudioBuffers() {
        let src = BackgroundAudioHandler.MAIN_MENU_A_AUDIO_SRC;
        if (Math.random() < 0.5) {
            src = BackgroundAudioHandler.MAIN_MENU_B_AUDIO_SRC;
        }
        this.getAudioBuffer(this.getFullSource(src)).then((audioBuffer: AudioBuffer) => {
            this.mainMenuAudioBuffer = audioBuffer;
            if (this.enabled && this.playAudioOnLoad && this.state === State.MAIN_MENU) {
                this.playAudioBuffer(audioBuffer);
            }
        });
        this.getAudioBuffer(this.getFullSource(BackgroundAudioHandler.CONNECTION_MENU_AUDIO_SRC)).then((audioBuffer: AudioBuffer) => {
            this.connectionMenuAudioBuffer = audioBuffer;
        });
        this.getAudioBuffer(this.getFullSource(BackgroundAudioHandler.SPECTATING_AUDIO_SRC)).then((audioBuffer: AudioBuffer) => {
            this.spectatingAudioBuffer = audioBuffer;
        });
        this.getAudioBuffer(this.getFullSource(BackgroundAudioHandler.LIVE_AUDIO_SRC)).then((audioBuffer: AudioBuffer) => {
            this.liveAudioBuffer = audioBuffer;
            this.startRecordingBufferSource(audioBuffer);
        });
    }

    private getFullSource(source: string) {
        if (this.useMP3) {
            return source + ".mp3";
        } else {
            return source + ".ogg";
        }
    }

    private getAudioBuffer(source: string): Promise<AudioBuffer> {
        return new Promise((resolve) => {
            fetch(source).then((response: Response) => {
                return response.arrayBuffer();
            }).then((rawBuffer: ArrayBuffer) => {
                this.audioContext.decodeAudioData(rawBuffer, resolve);
            }).catch(console.error);
        });
    }

    private playAudioBuffer(audioBuffer: AudioBuffer) {
        if (this.audioContext.state === "suspended") {
            this.audioContext.resume().then(() => {
                this.bufferSource = this.startBufferSource(audioBuffer);
            });
        } else {
            this.stopBufferSource(this.bufferSource);
            this.bufferSource = this.startBufferSource(audioBuffer);
        }
    }

    private startBufferSource(audioBuffer: AudioBuffer) {
        this.updateGain();
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.connect(this.gainNode);
        bufferSource.buffer = audioBuffer;
        bufferSource.loop = true;
        bufferSource.start();
        return bufferSource;
    }

    private stopCurrentBufferSource() {
        this.stopBufferSource(this.bufferSource);
    }

    private stopBufferSource(bufferSource: AudioBufferSourceNode | undefined) {
        if (bufferSource) {
            bufferSource.stop();
        }
    }

    private startRecordingBufferSource(buffer: AudioBuffer) {
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.connect(this.recordingGainNode);
        bufferSource.buffer = buffer;
        bufferSource.loop = true;
        bufferSource.start();
    }
}
