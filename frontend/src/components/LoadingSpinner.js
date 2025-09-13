import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner">
        <Loader2 size={50} className="animate-spin" />
      </div>
      <div className="loading-text">
        Loading board...
      </div>
    </div>
  );
};

export default LoadingSpinner;