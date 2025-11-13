"use client";

import { useState, useRef } from "react";

export default function RecorderPanel() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);

  // 🔹 Upload the recorded audio to backend with JWT
  const uploadAudio = async (blob: Blob) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Please log in first.");
      window.location.href = "/login"; // redirect to login page
      return;
    }
  
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
  
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
  
      if (!res.ok) {
        const text = await res.text();
        setBackendResponse(`Server error: ${res.status} - ${text}`);
        return;
      }
  
      const data = await res.json();
      setBackendResponse(data.transcript || "No transcript received");
    } catch (err) {
      setBackendResponse("Failed to upload audio");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  // 🔹 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioURL(null);
      setBackendResponse(null);
      setTimer(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        uploadAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      intervalRef.current = window.setInterval(() => setTimer((t) => t + 1), 1000);
    } catch (err) {
      console.error("🎤 Microphone access denied or error:", err);
      alert("Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setTimer(0); 
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 m-4 border rounded shadow bg-white">
      <div className="flex items-center gap-4">
        <button onClick={startRecording} disabled={recording} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">Start</button>
        <button onClick={stopRecording} disabled={!recording} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">Stop</button>
        <span className="ml-2 font-mono">{formatTime(timer)}</span>
        {recording && <span className="ml-2 w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>}
      </div>

      {audioURL && (
        <div className="mt-4">
          <audio controls src={audioURL} className="w-full" />
          <a href={audioURL} download={`recording_${Date.now()}.webm`} className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded">Download .webm</a>
        </div>
      )}

      {loading && <p className="mt-2 text-blue-600 font-semibold">⏳ Transcribing... please wait</p>}

      {backendResponse && (
  <div className="mt-4 p-2 bg-gray-100 rounded border">
    <strong>Transcript:</strong>
    <pre className="whitespace-pre-wrap">{backendResponse}</pre>

    <div className="mt-3 flex gap-3">
      <button
        onClick={() => {
          const blob = new Blob([backendResponse], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "transcript.txt";
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        Download .txt
      </button>

      <button
        onClick={async () => {
          const token = localStorage.getItem("token");
          const res = await fetch("http://127.0.0.1:5000/download_docx/latest", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            alert("❌ Failed to download DOCX file.");
            return;
          }
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "transcript.docx";
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Download .docx
      </button>
    </div>
  </div>
)}
 </div>
  );
}
