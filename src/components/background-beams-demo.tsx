"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import NoiseBackgroundDemo from "./noise-background-demo";

export default function BackgroundBeamsDemo() {
  return (
    <div className="h-screen w-full  bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          Rental Flow
        </h1>
        <p></p>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          The system must support Customers, Vendors, and Admins, and should follow a complete
          rental lifecycle, from product browsing and quotation creation to payment, invoicing, pickup,
          return, and reporting.
        </p>
        <NoiseBackgroundDemo />
      </div>
      <BackgroundBeams />
    </div>
  );
}
