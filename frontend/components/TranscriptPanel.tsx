export default function TranscriptPanel() {
    const transcripts = ["Transcript 1", "Transcript 2"]; // placeholder
  
    return (
      <div className="p-4 m-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Transcript History</h2>
        <ul className="list-disc list-inside">
          {transcripts.map((t, i) => (
            <li key={i} className="mb-1">{t}</li>
          ))}
        </ul>
      </div>
    );
  }
  