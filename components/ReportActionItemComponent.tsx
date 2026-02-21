export default function ReportActionItemComponent({
  text,
  score,
}: {
  text: string;
  score?: number;
}) {
  return (
    <div>
      <h3> - {text}</h3>
    </div>
  );
}
