import React from 'react';
import { render, screen } from '@testing-library/react';
import NFTasticSite from './NFTasticSite';

test('renders NFTastic site', () => {
  render(<NFTasticSite />);
  const linkElement = screen.getByText(/nftastic/i);
  expect(linkElement).toBeInTheDocument();
});