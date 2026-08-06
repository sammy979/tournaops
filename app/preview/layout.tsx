export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 0, background: "transparent" }}>
      {children}
    </div>
  );
}