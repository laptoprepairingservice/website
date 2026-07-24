"use client";

import TextLoop from "./animation/text-loop";
import TextShimmer from "./animation/text-shimmer";

export function LoadingScreen({ loadingText }) {
  const loadingPhrases = [
    "Initializing modules…",
    "Syncing data streams…",
    "Preparing your workspace…",
    "Aligning components…",
    "Fetching latest insights…",
    "Optimizing performance metrics…",
    "Loading environment context…",
    "Calibrating interface…",
    "Finalizing setup…",
    "Almost there, wrapping up…",
  ];

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center font-normal select-none">
      {loadingText ? (
        <TextShimmer spread={4} duration={0.8} className={"text-4xl"}>
          {loadingText}
        </TextShimmer>
      ) : (
        <TextLoop
          className="overflow-y-clip font-mono text-2xl"
          transition={{
            type: "spring",
            stiffness: 900,
            damping: 80,
            mass: 10,
          }}
          variants={{
            initial: {
              y: 20,
              rotateX: 90,
              opacity: 0,
              filter: "blur(4px)",
            },
            animate: {
              y: 0,
              rotateX: 0,
              opacity: 1,
              filter: "blur(0px)",
            },
            exit: {
              y: -20,
              rotateX: -90,
              opacity: 0,
              filter: "blur(4px)",
            },
          }}
        >
          {loadingPhrases.map((text, index) => (
            <span key={index}>
              <TextShimmer spread={3} duration={1}>
                {text}
              </TextShimmer>
            </span>
          ))}
        </TextLoop>
      )}
    </div>
  );
}
