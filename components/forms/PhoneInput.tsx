import * as React from "react"
import { Input } from "@/components/ui/input"

export interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .substring(0, 15);
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onChange, error, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      e.target.value = formatted;
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Input
        type="text"
        maxLength={15}
        placeholder="(00) 00000-0000"
        onChange={handleChange}
        ref={ref}
        className={error ? "border-danger focus-visible:ring-danger" : className}
        {...props}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
