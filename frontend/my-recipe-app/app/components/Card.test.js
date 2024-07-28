import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../components/Card';

// Test suite for the Card component
describe('Card Component', () => {
  // Test case to check if the Card component renders
  test('renders the Card component', () => {
    render(<Card />);
    const card = screen.getByRole('link');
    expect(card).toBeInTheDocument();
  });

  // Test case to check if the recipe image renders
  test('renders the recipe image', () => {
    render(<Card recipe={{image: 'https://example.com/image.jpg'}} />);
    const recipeImage = screen.getByAltText('recipe image');
    expect(recipeImage).toBeInTheDocument();
    expect(recipeImage).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  // Test case to check if the recipe title renders
  test('renders the recipe title', () => {
    render(<Card recipe={{title: 'Recipe Title'}} />);
    const recipeTitle = screen.getByText('Recipe Title');
    expect(recipeTitle).toBeInTheDocument();
  });
});

