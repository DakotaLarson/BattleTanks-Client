import { Group, Mesh, PositionalAudio } from "three";

export default interface IPlayerObj {
    id: number;
    modelId: string;
    group: Group;
    body: Group;
    head: Group;
    movementVelocity: number;
    nameplate?: Mesh;
    engineAudio?: PositionalAudio;
}
