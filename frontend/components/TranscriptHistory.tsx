"use client";
import { useEffect, useState } from "react";

export default function TranscriptHistory() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/history")
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🕓 Transcript History</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">No transcripts found yet.</p>
      ) : (
        <ul>
          {items.map((it) => (
            <li
              key={it.id}
              className="p-4 mb-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <div className="text-sm text-gray-500">
                {new Date(it.created_at).toLocaleString()}
              </div>
              <div className="mt-2 text-gray-800">
                {it.transcript.slice(0, 200)}
                {it.transcript.length > 200 ? "..." : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
