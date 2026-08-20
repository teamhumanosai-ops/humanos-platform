import type {
  Recommendation,
} from "@/brain/recommendation";

type RecommendationListProps = {
  recommendations: Recommendation[];
};

function formatKind(
  kind: Recommendation["kind"]
): string {
  return kind
    .replace(
      /_/g,
      " "
    )
    .replace(
      /^./,
      (value) =>
        value.toUpperCase()
    );
}

function formatEvidenceSource(
  source: Recommendation["evidence"][number]["source"]
): string {
  return source
    .replace(
      /_/g,
      " "
    )
    .replace(
      /^./,
      (value) =>
        value.toUpperCase()
    );
}

export default function RecommendationList({
  recommendations,
}: RecommendationListProps) {
  if (
    recommendations.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Recommended Next Steps
      </div>

      <div className="space-y-3">
        {recommendations.map(
          (recommendation, index) => (
            <div
              key={
                recommendation.id
              }
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-zinc-300">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-6 text-white">
                      {recommendation.statement}
                    </div>

                    <div className="mt-1 text-xs leading-5 text-zinc-400">
                      {recommendation.rationale}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right text-[10px] uppercase tracking-wide text-zinc-500">
                  <div>
                    {formatKind(
                      recommendation.kind
                    )}
                  </div>

                  <div className="mt-1">
                    {Math.round(
                      recommendation.confidence *
                        100
                    )}% confidence
                  </div>
                </div>
              </div>

              {recommendation.evidence.length >
                0 && (
                <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                  {recommendation.evidence.map(
                    (evidence, evidenceIndex) => (
                      <div
                        key={`${recommendation.id}-${evidence.source}-${evidenceIndex}`}
                        className="text-xs leading-5 text-zinc-500"
                      >
                        <span className="text-zinc-400">
                          {formatEvidenceSource(
                            evidence.source
                          )}
                          :
                        </span>{" "}
                        {evidence.statement}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
