export default function Photo({ src, className = "", children, position = "center" }) {
  return (
    <div
      className={`photo-fallback ${className}`}
      style={{ backgroundImage: `url(${src})`, backgroundPosition: position }}
    >
      {children}
    </div>
  );
}
