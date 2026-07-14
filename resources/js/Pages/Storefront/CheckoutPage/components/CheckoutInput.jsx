import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

export default function CheckoutInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required, 
  type = "text", 
  helperText,
  error
}) {
  const hasValue = String(value || '').length > 0;
  const isInvalid = !!error;

  return (
    <div className="w-full space-y-2">
      <label className="block text-[12px] font-extrabold uppercase tracking-widest text-neutral-955 text-neutral-950 flex justify-between">
        <span>{label} {required && '*'}</span>
      </label>
      
      <div className={`relative border rounded-none h-12 bg-white flex items-center px-4 transition-all duration-200 ${
        isInvalid 
          ? 'border-red-500 focus-within:border-red-600' 
          : hasValue 
            ? 'border-emerald-600 focus-within:border-emerald-700' 
            : 'border-neutral-300 focus-within:border-black'
      }`}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[15px] font-bold text-neutral-900 outline-none border-none p-0 focus:ring-0 placeholder:text-neutral-300 placeholder:text-[14px]"
          placeholder={placeholder}
          required={required}
        />
        
        {isInvalid ? (
          <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 ml-2 animate-bounce" />
        ) : hasValue ? (
          <Check className="h-4.5 w-4.5 text-emerald-600 shrink-0 ml-2" />
        ) : null}
      </div>

      {isInvalid ? (
        <p className="text-[10.5px] text-red-500 font-bold flex items-center gap-1 mt-1 pl-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-neutral-400 font-semibold pl-1 mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
