'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'EUR' | 'MAD';

interface CurrencyDef {
  symbol: string;
  name: string;
  code: Currency;
  locale: string;
  position: 'before' | 'after';
}

const currencies: Record<Currency, CurrencyDef> = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD', locale: 'en-US', position: 'before' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR', locale: 'fr-FR', position: 'before' },
  MAD: { symbol: 'MAD', name: 'Moroccan Dirham', code: 'MAD', locale: 'ar-MA', position: 'after' },
};

const rates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  MAD: 10.10,
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInUSD: number) => string;
  convert: (amountInUSD: number) => number;
  currencies: Record<Currency, CurrencyDef>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const stored = localStorage.getItem('manom_currency') as Currency | null;
    if (stored && currencies[stored]) {
      setCurrencyState(stored);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('manom_currency', c);
  };

  const convert = (amountInUSD: number): number => {
    return Math.round(amountInUSD * rates[currency] * 100) / 100;
  };

  const formatPrice = (amountInUSD: number): string => {
    const converted = convert(amountInUSD);
    const def = currencies[currency];

    if (currency === 'MAD') {
      return `${converted.toFixed(2)} ${def.symbol}`;
    }

    return new Intl.NumberFormat(def.locale, {
      style: 'currency',
      currency: def.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convert, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
