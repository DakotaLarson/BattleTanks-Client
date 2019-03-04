import { Group, Mesh, PositionalAudio } from "three";

export default interface IPlayerObj {
    body: Mesh;
    head: Mesh;
    movementVelocity: number;
    nameplate?: Mesh;
    healthBar?: Group;
    shieldBar?: Group;
    protectionSphere?: Group;
    engineAudio?: PositionalAudio;
}
