import React, { useState, useEffect } from "react";
import BalanceCard, { getAccountVariant } from "@/components/banking/BalanceCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

// Carrusel de tarjetas con deslizamiento BNC
// Autor: SkayJ
const VARIANT_ORDER = { blue: 0, green: 1, gold: 2 };

export default function BalanceCardCarousel({ accounts }) {
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);

  if (!accounts || accounts.length === 0) return null;

  // Ordenar: azul (corriente/ahorro VES) primero, luego verde (USD), luego dorada (credito)
  const sortedAccounts = [...accounts].sort((a, b) => {
    const va = VARIANT_ORDER[getAccountVariant(a)] ?? 99;
    const vb = VARIANT_ORDER[getAccountVariant(b)] ?? 99;
    return va - vb;
  });

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (sortedAccounts.length === 1) {
    return <BalanceCard account={sortedAccounts[0]} variant={getAccountVariant(sortedAccounts[0])} />;
  }

  return (
    <Carousel
      setApi={setApi}
      className="w-full"
      opts={{
        align: "start",
      }}
    >
      <CarouselContent className="-ml-4">
        {sortedAccounts.map((acc, i) => (
          <CarouselItem key={acc.id || i} className="pl-4 basis-full">
            <BalanceCard account={acc} variant={getAccountVariant(acc)} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Indicadores de puntos */}
      <div className="flex justify-center gap-1.5 mt-3">
        {sortedAccounts.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </Carousel>
  );
}