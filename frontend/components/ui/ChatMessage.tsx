import type {
  Recommendation,
} from "@/brain/recommendation";

import RecommendationList from "./RecommendationList";

type Citation = {
  index: number;
  title: string;
  url: string;
  domain: string;
  publishedDate?: string;
};

type ChatMessageProps = {
  role: "user" | "assistant";

  message: string;

  citations?: Citation[];

  recommendations?: Recommendation[];
};

function parseCitationMarkers(
  text: string,
  citations: Citation[]
) {
  const parts =
    text.split(
      /(\[\d+\])/
    );

  return parts.map(
    (part, index) => {
      const match =
        part.match(
          /^\[(\d+)\]$/
        );

      if (!match) {
        return (
          <span
            key={index}
          >
            {part}
          </span>
        );
      }

      const citationIndex =
        Number(match[1]);

      const citation =
        citations.find(
          (item) =>
            item.index ===
            citationIndex
        );

      if (!citation) {
        return (
          <span
            key={index}
          >
            {part}
          </span>
        );
      }

      return (
        <a
          key={index}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          title={
            citation.title
          }
          className="
            mx-0.5
            inline-flex
            items-center
            justify-center
            rounded-md
            border
            border-white/20
            bg-white/10
            px-1.5
            py-0.5
            text-xs
            font-semibold
            text-(--primary)
            transition
            hover:bg-white/20
          "
        >
          {citationIndex}
        </a>
      );
    }
  );
}

function renderMessage(
  message: string,
  citations: Citation[]
) {
  return message
    .split("\n")
    .map(
      (line, index) => (
        <p
          key={index}
          className={
            line.trim()
              ? "mb-2 last:mb-0"
              : "h-3"
          }
        >
          {parseCitationMarkers(
            line,
            citations
          )}
        </p>
      )
    );
}

export default function ChatMessage({
  role,
  message,
  citations = [],
  recommendations = [],
}: ChatMessageProps) {
  const isUser =
    role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[75%]
          rounded-3xl
          px-5
          py-4
          text-base
          leading-7
          transition-all
          duration-300

          ${
            isUser
              ? "bg-(--primary) text-white"
              : "bg-white/5 border border-white/10 text-white"
          }
        `}
      >
        {renderMessage(
          message,
          citations
        )}

        {!isUser && (
          <RecommendationList
            recommendations={
              recommendations
            }
          />
        )}

        {!isUser &&
          citations.length >
            0 && (
            <div
              className="
                mt-4
                border-t
                border-white/10
                pt-3
              "
            >
              <div
                className="
                  mb-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-zinc-400
                "
              >
                Sources
              </div>

              <div
                className="
                  space-y-1.5
                "
              >
                {citations.map(
                  (
                    citation
                  ) => (
                    <a
                      key={
                        citation.index
                      }
                      href={
                        citation.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        block
                        text-sm
                        text-zinc-300
                        transition
                        hover:text-(--primary)
                      "
                    >
                      [{citation.index}]{" "}
                      {
                        citation.title
                      }{" "}
                      <span className="text-zinc-500">
                        —{" "}
                        {
                          citation.domain
                        }
                      </span>
                    </a>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
