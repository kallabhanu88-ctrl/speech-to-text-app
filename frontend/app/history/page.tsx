"use client";
import { useEffect, useState } from "react";
import Header from "../../components/Header";

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:5000/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  // ✅ Download transcript as plain text
  const downloadTxt = (title: string, transcript: string) => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ Download transcript as .docx from backend
  const downloadDocx = async (id: number, title: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:5000/download_docx/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      alert("❌ Failed to download DOCX file.");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <h2 className="text-2xl font-bold p-4">🕓 Transcript History</h2>

      <ul className="space-y-3 p-4">
        {items.map((it) => (
          <li key={it.id} className="p-4 bg-white shadow rounded-lg">
            <div className="font-semibold text-gray-800">
              {new Date(it.created_at).toLocaleString()}
            </div>

            <p className="text-gray-700 mt-2">
              {it.transcript.slice(0, 200)}
              {it.transcript.length > 200 ? "..." : ""}
            </p>

            <div className="flex gap-2 mt-3">
              {/* Copy */}
              <button
                onClick={() => navigator.clipboard.writeText(it.transcript)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>

              {/* Download .txt */}
              <button
                onClick={() =>
                  downloadTxt(it.title || `transcript_${it.id}`, it.transcript)
                }
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                .txt
              </button>

              {/* Download .docx */}
              <button
                onClick={() =>
                  downloadDocx(it.id, it.title || `transcript_${it.id}`)
                }
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                .docx
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
