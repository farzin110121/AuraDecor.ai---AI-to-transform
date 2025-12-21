
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
        id={id}
        className="w-full bg-brand-gray border border-gray-600 rounded-lg px-4 py-3 text-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold"
        {...props}
      />
    </div>
  );
};

export default Input;
