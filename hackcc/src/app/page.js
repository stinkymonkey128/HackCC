"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const router = useRouter();

  function clicked() {
    console.log(query);
    fetch('http://127.0.0.1:5000/?song=' + query).then(res => res.json()).then(response => {
      setData(response);

      router.push('/result?song=' + query);
    })
  }
  return (
    <div className="grid min-h-screen bg-gray-100">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 flex items-center bg-gray-100 z-10">
        <h1 className="text-2xl font-bold">melodize</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 mt-16">
        <Label
          htmlFor="songInput"
          className="mb-4 text-lg text-center text-gray-700"
        >
          How are you feeling today?
        </Label>
        <div className="w-full max-w-md">
          <Input
            id="songInput"
            placeholder="Type a song name..."
            className="w-full"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
          <button onClick={clicked}>click me</button>
        </div>

        {JSON.stringify(data)}
      </main>
    </div>
  );
}
