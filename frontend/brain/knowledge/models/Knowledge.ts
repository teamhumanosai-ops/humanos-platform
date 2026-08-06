import { KnowledgeEntity } from "./KnowledgeEntity";
import { KnowledgeRelationship } from "./KnowledgeRelationship";
import { KnowledgeSummary } from "./KnowledgeSummary";

export interface Knowledge {
    summary: KnowledgeSummary;

    entities: KnowledgeEntity[];

    relationships: KnowledgeRelationship[];
}