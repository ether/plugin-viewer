import React from 'react';
import { render, screen } from '@testing-library/react';
import Plugin from './Plugin';

test('renders plugin component', () => {
  const testData = {
    name: 'ep_page_view',
    description: 'Test description',
    time: '2017-08-03',
    version: '0.5.24',
    data: {
      'dist-tags': '0.5.24',
      time: {
        '0.5.24': '2017-08-03T16:00:56.848Z',
      },
      keywords: ['page view', 'pv'],
    }
  };

  render(<Plugin value={testData}/>);
  expect(screen.getByText('ep_page_view')).toBeInTheDocument();
  expect(screen.getByText('Test description')).toBeInTheDocument();
  expect(screen.queryByText('Author: ')).not.toBeInTheDocument();
  expect(screen.getByText('page view')).toBeInTheDocument();
  expect(screen.getByText('pv')).toBeInTheDocument();

  const npmLink = screen.getByRole('link');
  expect(npmLink).toHaveTextContent('Open on npm');
  expect(npmLink.closest('a')).toHaveAttribute('href', 'https://www.npmjs.org/package/ep_page_view');
});