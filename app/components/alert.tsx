interface AlertProps {
    children: React.ReactNode;
    variant?: 'default' | 'destructive';
    className?: string;
  }
  
  export const Alert = ({ children, variant = 'default', className = '' }: AlertProps) => {
    const variantStyles = {
      default: 'bg-blue-50 text-blue-800 border-blue-200',
      destructive: 'bg-red-50 text-red-800 border-red-200'
    };
  
    return (
      <div className={`p-4 border rounded-md ${variantStyles[variant]} ${className}`}>
        {children}
      </div>
    );
  };
  
  export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm">{children}</p>
  );