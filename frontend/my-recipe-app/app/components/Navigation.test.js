import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../components/Navigation';

// Test suite for the Navigation component
describe('Navigation Component', () => {
  // Test case to check if the Navigation component renders
  test('renders the Navigation component', () => {
    render(<Navigation />);
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
  });

  // Test case to check if the navigation title renders
  test('renders the navigation title', () => {
    render(<Navigation />);
    const navigationTitle = screen.getByText('Recipes');
    expect(navigationTitle).toBeInTheDocument();
  });

  // Test case to check if the navigation links render
  test('renders the navigation links', () => {
    render(<Navigation />);
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    const createLink = screen.getByText('Create Recipes');
    expect(createLink).toBeInTheDocument();
    const servicesLink = screen.getByText('Services');
    expect(servicesLink).toBeInTheDocument();
  });
});
