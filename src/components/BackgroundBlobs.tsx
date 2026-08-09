export default function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#17040a]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(225,29,72,0.42), transparent 45%), radial-gradient(circle at 85% 15%, rgba(244,63,94,0.24), transparent 50%), radial-gradient(circle at 50% 100%, rgba(136,19,55,0.38), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="animate-float absolute -left-24 top-[-10%] h-[420px] w-[420px] rounded-full bg-rose-700/40 blur-[110px]" />
      <div className="animate-float-slow absolute right-[-10%] top-[20%] h-[380px] w-[380px] rounded-full bg-rose-600/25 blur-[100px]" />
      <div className="animate-pulse-glow absolute bottom-[-15%] left-[30%] h-[460px] w-[460px] rounded-full bg-pink-800/30 blur-[110px]" />
    </div>
  );
}
