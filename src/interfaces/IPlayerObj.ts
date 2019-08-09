import { Group, Mesh, PositionalAudio } from "three";

export default interface IPlayerObj {
    id: number;
    modelId: string;
    group: Group;
    body?: Mesh;
    head?: Mesh;
    movementVelocity: number;
    nameplate?: Group;
    engineAudio?: PositionalAudio;
    recordedEngineAudio?: PositionalAudio;
    headOffset?: number;
}
