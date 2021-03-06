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
      'dist-tags': {
        'latest': '0.5.24',
      },
      time: {
        '0.5.24': '2017-08-03T16:00:56.848Z',
      },
      keywords: ['page view', 'pv'],
    },
    downloads: 150
  };

  let pluginNameShy = testData.name.replace(/_/g, '_\u00AD');

  render(<Plugin value={testData}/>);
  const title = screen.getByText(pluginNameShy);
  expect(title).toBeInTheDocument();
  expect(title.closest('a')).toHaveAttribute('href', 'https://www.npmjs.org/package/ep_page_view');

  expect(screen.getByText('Test description')).toBeInTheDocument();
  expect(screen.queryByText('Author: ')).not.toBeInTheDocument();
  expect(screen.getByText('page view')).toBeInTheDocument();
  expect(screen.getByText('pv')).toBeInTheDocument();
  expect(screen.getByText('License: -')).toBeInTheDocument();

  const npmLink = screen.getByRole('link', {name: 'npm'});
  expect(npmLink).toHaveTextContent('npm');
  expect(npmLink.closest('a')).toHaveAttribute('href', 'https://www.npmjs.org/package/ep_page_view');

  expect(screen.getByTitle('Aug 3, 2017 6:00 PM')).toBeInTheDocument();
});