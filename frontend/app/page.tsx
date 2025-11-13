"use client";

import { useState } from "react";
import Header from "../components/Header";
import RecorderPanel from "../components/RecorderPanel";
import Link from "next/link";

export default function Home() {
  const [transcript, setTranscript] = useState(""); // optional for later

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <RecorderPanel />
      <div className="mt-6">
        <Link
          href="/history"
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          🕓 View Transcript History
        </Link>
      </div>
    </div>
  );
}
