import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('renders loading text', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading board...')).toBeInTheDocument();
  });

  test('renders spinner element', () => {
    render(<LoadingSpinner />);
    
    const spinnerContainer = screen.getByText('Loading board...').parentElement;
    expect(spinnerContainer).toHaveClass('loading-container');
  });
});