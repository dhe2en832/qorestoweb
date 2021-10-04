import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../scripts/App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/CSA Computer/i);
  expect(linkElement).toBeInTheDocument();
});
