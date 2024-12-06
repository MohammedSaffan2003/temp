import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );
}