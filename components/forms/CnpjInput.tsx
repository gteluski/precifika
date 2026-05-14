import * as React from "react"
import { Input } from "@/components/ui/input"
import { formatCnpj } from "@/lib/utils/cnpj"

export interface CnpjInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const CnpjInput = React.forwardRef<HTMLInputElement, CnpjInputProps>(
  ({ className, onChange, error, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCnpj(e.target.value);
      e.target.value = formatted;
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Input
        type="text"
        maxLength={18}
        placeholder="00.000.000/0001-00"
        onChange={handleChange}
        ref={ref}
        className={error ? "border-danger focus-visible:ring-danger" : className}
        {...props}
      />
    )
  }
)
CnpjInput.displayName = "CnpjInput"

export { CnpjInput }
