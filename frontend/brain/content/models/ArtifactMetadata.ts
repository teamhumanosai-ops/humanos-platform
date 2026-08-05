import { ArtifactType } from "./ArtifactType";

export interface ArtifactMetadata {
  id: string;

  name: string;

  type: ArtifactType;

  mimeType: string;

  extension: string;

  size: number;

  checksum?: string;

  source?: string;

  createdAt: Date;

  updatedAt: Date;
}