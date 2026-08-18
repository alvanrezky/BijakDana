"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { formatRupiah } from "@/lib/utils/format";

export default function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value]);

  return <>{formatRupiah(display)}</>;
}