import { Group, Mesh, PositionalAudio } from "three";

export default interface IPlayerObj {
    body: Group;
    head: Group;
    movementVelocity: number;
    nameplate?: Mesh;
    healthBar?: Group;
    shieldBar?: Group;
    protectionSphere?: Group;
    engineAudio?: PositionalAudio;
}
