"use client";

import { useSearchParams } from 'next/navigation';

export default function Result() {

  return (
    <div className="grid min-h-screen bg-gray-100">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 flex items-center bg-gray-100 z-10">
        <h1 className="text-2xl font-bold">melodize</h1>
      </header>
    </div>
  );
}