import React from "react";

interface LiveIndicatorProps {
  minute?: number;
}

export default function LiveIndicator({ minute }: LiveIndicatorProps) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-[5px] w-[5px]">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ background: "#FF0000" }}
        />
        <span
          className="relative inline-flex rounded-full h-[5px] w-[5px]"
          style={{ background: "#FF0000" }}
        />
      </span>
      <span
        style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          color: "#FF0000",
        }}
      >
        LIVE{minute !== undefined ? ` · ${minute}'` : ""}
      </span>
    </span>
  );
}
