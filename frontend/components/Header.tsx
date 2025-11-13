"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uname = localStorage.getItem("username");
    if (token && uname) setUsername(uname);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between">
      <h1 className="font-bold">Speech-to-Text App</h1>
      {username && (
        <div className="flex gap-4 items-center">
          <span>{username}</span>
          <button
            onClick={logout}
            className="bg-red-600 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
