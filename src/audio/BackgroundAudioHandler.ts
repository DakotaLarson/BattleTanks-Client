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

    private static readonly MAIN_MENU_AUDIO_SRC = "res/audio/music/main_menu";
    private static readonly CONNECTION_MENU_AUDIO_SRC = "res/audio/music/connection_menu";
    private static readonly SPECTATING_AUDIO_SRC = "res/audio/music/spectating";
    private static readonly LIVE_AUDIO_SRC = "res/audio/music/live";

    private audioContext: AudioContext;

    private gainNode: GainNode;
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

    constructor() {
        super();

        if (!AudioContext) {
            // @ts-ignore Safari is lagging behind.
            window.AudioContext = window.webkitAudioContext;
            this.useMP3 = true;
        } else {
            this.useMP3 = false;
        }
        this.audioContext = new AudioContext();

        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = Options.options.musicVolume;
        this.gainNode.connect(this.audioContext.destination);

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
        this.state = State.MAIN_MENU;
        if (this.enabled) {
            if (this.mainMenuAudioBuffer) {
                this.playAudioBuffer(this.mainMenuAudioBuffer);
            } else {
                this.playAudioOnLoad = true;
                this.stopCurrentBufferSource();
            }
        }
    }

    private onAudioConnectionMenu() {
        this.state = State.CONNECTION_MENU;
        if (this.enabled) {
            if (this.connectionMenuAudioBuffer) {
                this.playAudioBuffer(this.connectionMenuAudioBuffer);
            } else {
                console.warn("Connection Menu audio not loaded!");
            }
        }
    }

    private onAudioSpectating() {
        this.state = State.SPECTATING;
        if (this.enabled) {
            if (this.spectatingAudioBuffer) {
                this.playAudioBuffer(this.spectatingAudioBuffer);
            } else {
                console.warn("Spectating audio not loaded!");
            }
        }
    }

    private onAudioLive() {
        this.state = State.LIVE;
        if (this.enabled) {
            if (this.liveAudioBuffer) {
                this.playAudioBuffer(this.liveAudioBuffer);
            } else {
                console.warn("Live audio not loaded!");
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
        } else {
            this.gainNode.gain.value = value;
        }
    }

    private getAudioBuffers() {
        this.getAudioBuffer(this.getFullSource(BackgroundAudioHandler.MAIN_MENU_AUDIO_SRC)).then((audioBuffer: AudioBuffer) => {
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

}
