import { Artifact } from "../models";

export interface ContentProcessor {
    readonly name: string;

    canProcess(artifact: Artifact): boolean;

    process(artifact: Artifact): Promise<Artifact>;
}