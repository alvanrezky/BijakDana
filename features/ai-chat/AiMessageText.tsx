export default function AiMessageText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        const isBullet = /^(📝|•|-)\s/.test(line.trim());
        const content = renderInline(isBullet ? line.trim().replace(/^(📝|•|-)\s/, "") : line);
        const prefix = isBullet ? (line.trim().match(/^(📝|•|-)/)?.[0] || "•") : null;

        if (isBullet) {
          return (
            <div key={i} style={{ display: "flex", gap: 6, marginTop: 2 }}>
              <span>{prefix}</span>
              <span>{content}</span>
            </div>
          );
        }
        return (
          <div key={i} style={{ minHeight: line.trim() === "" ? 8 : undefined }}>
            {content}
          </div>
        );
      })}
    </>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}