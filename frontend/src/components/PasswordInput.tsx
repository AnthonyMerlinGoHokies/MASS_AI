import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  showStrength?: boolean;
  className?: string;
  required?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  error,
  showStrength = false,
  className = "",
  required = false,
  onFocus,
  onBlur,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = (): 'weak' | 'medium' | 'strong' | null => {
    if (!value || value.length === 0) return null;
    if (value.length < 8) return 'weak';

    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const criteriaMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (criteriaMet >= 3 && value.length >= 12) return 'strong';
    if (criteriaMet >= 2 && value.length >= 8) return 'medium';
    return 'weak';
  };

  const strength = showStrength ? getStrength() : null;

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`pr-10 transition-all ${className}`}
          style={{
            borderColor: error ? '#FF3B3B' : '#3A4656',
            backgroundColor: '#16202A',
            color: '#E6EDF4',
          }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            <div className={`h-1 flex-1 rounded ${strength ? getStrengthColor() : 'bg-gray-300'}`} />
            <div className={`h-1 flex-1 rounded ${strength && strength !== 'weak' ? getStrengthColor() : 'bg-gray-300'}`} />
            <div className={`h-1 flex-1 rounded ${strength === 'strong' ? getStrengthColor() : 'bg-gray-300'}`} />
          </div>
          {strength && (
            <p className="text-xs text-gray-400">
              Password strength: <span className={
                strength === 'weak' ? 'text-red-400' :
                strength === 'medium' ? 'text-yellow-400' :
                'text-green-400'
              }>{strength}</span>
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
