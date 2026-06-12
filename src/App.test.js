import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders line distribution with a 50 second default', () => {
  render(<App.MultipleTimers />);

  expect(screen.getByDisplayValue('Line Distribution')).toBeInTheDocument();
  expect(screen.getByDisplayValue('50')).toBeInTheDocument();
});

test('opens presets with command k and applies a group', () => {
  render(<App.MultipleTimers />);

  fireEvent.keyDown(window, { key: 'k', metaKey: true });
  fireEvent.click(screen.getByRole('button', { name: /twice/i }));

  expect(screen.getByDisplayValue('TWICE')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Nayeon')).toBeInTheDocument();
  expect(screen.getByDisplayValue('Tzuyu')).toBeInTheDocument();
});
