import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`
    bg-gray-900 
    rounded-lg 
    shadow-xl 
    p-6 
    border 
    border-gray-800
    backdrop-blur-sm 
    bg-opacity-90
    relative
    overflow-hidden
    ${className}
  `}>
    {/* Top left reflection */}
    <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
    
    {/* Bottom right reflection */}
    <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
    
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-800 to-transparent opacity-5"></div>
    
    {/* Content container */}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className="mb-6 relative">
    {/* Subtle header underline effect */}
    <div className={`absolute bottom-0 left-0 w-1/2 h-px bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 ${className}`}></div>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 ${className}`}>
    {children}
  </h2>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="text-gray-300">
    {children}
  </div>
);