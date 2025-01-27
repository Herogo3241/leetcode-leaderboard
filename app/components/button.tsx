// components/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline';
    className?: string;
  }
  
  export const Button = ({ 
    children, 
    variant = 'default', 
    className = '',
    disabled,
    ...props 
  }: ButtonProps) => {
    const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors';
    const variantStyles = {
      default: 'bg-blue-500 text-white hover:bg-blue-600',
      outline: 'border border-gray-300 hover:bg-gray-50'
    };
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
    return (
      <button
        {...props}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
      >
        {children}
      </button>
    );
  };
  