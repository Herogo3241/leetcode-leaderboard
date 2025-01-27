
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
  }
  
  export const Input = ({ className = '', ...props }: InputProps) => (
    <input
      {...props}
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black-500 text-black ${className}`}
    />
  );