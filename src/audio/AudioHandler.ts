import Component from '../component/ChildComponent';
import EventHandler from '../EventHandler';
import Audio from '../audio/Audio';
import {Audio as Three_Audio} from 'three';
import { PerspectiveCamera, AudioLoader, AudioBuffer, PositionalAudio, AudioListener } from 'three';
import Options from '../Options';

export default class AudioHandler extends Component{

    camera: PerspectiveCamera;
    audioListener: AudioListener;

    winAudioBuffer: AudioBuffer;
    loseAudioBuffer: AudioBuffer;

    constructor(camera: PerspectiveCamera, audioListener: AudioListener){
        super();
        
        this.camera =  camera; 
        this.audioListener = audioListener;

        let audioLoader = new AudioLoader();
        audioLoader.load('audio/win.wav', (buffer: AudioBuffer) => {
            this.winAudioBuffer = buffer;
        }, undefined, undefined);
        audioLoader.load('audio/lose.wav', (buffer: AudioBuffer) => {
            this.loseAudioBuffer = buffer;
        }, undefined, undefined);
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.AUDIO_REQUEST, this.onAudioRequest);
    }

    onAudioRequest(audio: Audio){
        switch(audio){
            case Audio.WIN:
                this.playBuffer(this.winAudioBuffer);
                break;
            case Audio.LOSE:
                this.playBuffer(this.loseAudioBuffer);
                break;
        }
    }

    playBuffer(buffer: AudioBuffer){
        let audio = new Three_Audio(this.audioListener);
        
        //this.camera.add(audio);

        // audio.onEnded = () => {
        //     audio.isPlaying = false;
        //     this.camera.remove(audio);
        // }
        audio.setVolume(Options.options.volume);
        audio.setBuffer(buffer);
        audio.play();
    }
}