import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders default page', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Etherpad plugins/);
  expect(linkElement).toBeInTheDocument();
});