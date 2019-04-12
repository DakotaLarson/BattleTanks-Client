import { Group, Mesh, PositionalAudio } from "three";

export default interface IPlayerObj {
    id: number;
    group: Group;
    body: Group;
    head: Group;
    movementVelocity: number;
    nameplate?: Mesh;
    protectionSphere?: Group;
    engineAudio?: PositionalAudio;
}
