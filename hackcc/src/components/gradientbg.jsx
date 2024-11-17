import React from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function MovingGradient({
  children,
  className = "",
  animated = true,
  gradientClassName = "",
  ...props
}) {
  const backgroundClassName = "pointer-events-none absolute h-full w-full";

  return (
    <div {...props} className={cn("relative overflow-hidden bg-white", className)}>
      <div
        className={cn(
          "bg-size bg-gradient-to-r from-yellow-500 from-30% via-yellow-700 via-50% to-pink-500 to-80% opacity-15",
          animated ? "animate-bg-position bg-[length:300%_auto]" : "",
          backgroundClassName,
          gradientClassName
        )}
      />
      <div className={cn(backgroundClassName, "z-1 blur-lg")} />
      {children}
    </div>
  );
}
