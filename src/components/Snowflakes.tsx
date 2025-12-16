export function Snowflakes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-holiday-snow opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            fontSize: `${Math.random() * 16 + 8}px`,
            animation: `fall ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        >
          ❄
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
