"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Slider from "@/components/slider";


export default function Home() {
  return (
    <div>
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 flex items-center bg-gray-100 z-10">
        <h1 className="text-2xl font-bold">melodize</h1>
      </header>
    
      {/* Main Content */}
      
      <Slider />
        <div style={{width:"100%; display:flex;justify-content:center;"}}>
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
          />
        </div>
        </div>
        
        

    </div>
  );
}
