// src/lib/useBCVRate.js
import { useState, useEffect } from "react";

export function useBCVRate() {
  const [rates, setRates] = useState({
    usdRate: null,
    eurRate: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Usamos una API global abierta sin restricciones de CORS para localhost
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        
        if (!response.ok) {
          throw new Error("Error al consultar el servidor internacional de divisas");
        }

        const data = await response.json();
        
        // Explicación: data.rates.VES nos da los bolívares por 1 USD
        // data.rates.EUR nos da los euros por 1 USD. 
        // Para sacar el Euro en Bolívares dividimos VES / EUR.
        const rawUsd = data?.rates?.VES;
        const rawEurRate = data?.rates?.EUR; 

        if (!rawUsd || !rawEurRate) {
          throw new Error("No se encontraron las tasas de cambio de Venezuela en el retorno");
        }

        const rawEur = rawUsd / rawEurRate;

        // CORTAMOS ESTRICTAMENTE A 2 DECIMALES
        const usdCortado = parseFloat(parseFloat(rawUsd).toFixed(2));
        const eurCortado = parseFloat(parseFloat(rawEur).toFixed(2));

        setRates({
          usdRate: usdCortado,
          eurRate: eurCortado,
          loading: false,
          error: null
        });

        // Guardamos el respaldo por si acaso
        localStorage.setItem("bnc_bcv_backup", JSON.stringify({
          usd: usdCortado,
          eur: eurCortado,
          date: new Date().toLocaleDateString()
        }));

      } catch (err) {
        // Recuperación de respaldo local
        const backup = localStorage.getItem("bnc_bcv_backup");
        if (backup) {
          const { usd, eur, date } = JSON.parse(backup);
          setRates({
            usdRate: usd,
            eurRate: eur,
            loading: false,
            error: `Usando tasas guardadas (${date})`
          });
        } else {
          // Último recurso en caso de estar totalmente desconectado de internet
          setRates({
            usdRate: 42.18,
            eurRate: 45.72,
            loading: false,
            error: "Modo fuera de línea"
          });
        }
      }
    };

    fetchRates();
  }, []);

  return rates;
}