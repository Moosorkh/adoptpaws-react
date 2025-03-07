# AdoptPaws React

![React](https://img.shields.io/badge/React-18.x-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Material UI](https://img.shields.io/badge/Material_UI-5.x-0081cb)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff)

A modern pet adoption platform built with React, TypeScript, and Material UI.

![AdoptPaws Banner](public/pets-favicon.svg)

## Overview

AdoptPaws is a responsive web application for pet adoption, allowing users to browse available pets, add them to a cart, and submit adoption requests. This project is built using modern React patterns and showcases best practices for building interactive UIs.

## Features

- **Responsive Design**: Optimized for all device sizes
- **Interactive UI**: Smooth transitions and micro-interactions
- **Pet Browsing**: Search, filter, and sort available pets
- **Shopping Cart**: Add pets to cart with quantity management
- **Contact Forms**: Multiple ways to get in touch
- **Location Information**: Map integration and directions
- **Team Profiles**: Meet the organization's team members
- **History Timeline**: Visual representation of organizational history

## Tech Stack

- **React**: Frontend library
- **TypeScript**: Type safety and better developer experience
- **Material UI**: Component library and design system
- **Vite**: Fast build tool
- **Context API**: State management
- **Custom Hooks**: Reusable logic
- **CSS-in-JS**: Styling with MUI's styled components

## Project Structure

```
adoptpaws-react/
├── public/
│   └── pets-favicon.svg
├── src/
│   ├── components/
│   │   ├── BackToTop.tsx
│   │   ├── Banner.tsx
│   │   ├── CartItem.tsx
│   │   ├── ContactForm.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ProductCard.tsx
│   │   └── ShoppingListModal.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── data/
│   │   └── products.ts
│   ├── hooks/
│   │   └── useLocalStorage.tsx
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── AboutSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── HomePage.tsx
│   │   └── ProductsSection.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Moosorkh/adoptpaws-react.git
   cd adoptpaws-react
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Build for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Key Components

### Pet Shopping Experience

The application provides a comprehensive pet adoption workflow:

1. **Browse Pets**: View all available pets with filtering and sorting
2. **View Details**: See detailed information about each pet
3. **Add to Cart**: Add pets to your adoption cart
4. **Manage Cart**: Adjust quantities or remove items
5. **Checkout**: Submit an adoption request

### Contact Options

Users can get in touch with the organization in multiple ways:

1. **Contact Form**: Send a message directly from the website
2. **Visit Information**: Find the physical location with an interactive map
3. **Contact Details**: Phone, email, and address information

### About the Organization

Learn more about the organization through:

1. **Team Profiles**: Meet the people behind AdoptPaws
2. **History Timeline**: See the key milestones in the organization's history
3. **Core Values**: Understand what drives the organization

## Design Decisions

- **Color Scheme**: The application uses a calming color palette with #96BBBB (light teal) and #3E4E50 (dark slate) as primary colors, creating a soothing experience appropriate for a pet adoption platform.

- **Typography**: Clear, readable fonts with proper hierarchy to guide the user through the content.

- **Interactive Elements**: All interactive elements have clear hover states and feedback to improve usability.

- **Animation**: Subtle animations and transitions to create a dynamic yet non-distracting user experience.

## Future Enhancements

- User authentication and profiles
- Pet favoriting system
- Adoption status tracking
- Admin dashboard for managing pets
- Pet categories and advanced filtering
- Responsive image optimization
- Dark mode support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Pet images sourced from [Unsplash](https://unsplash.com) and [Pixabay](https://pixabay.com)
- Icons from [Material UI Icons](https://mui.com/material-ui/icons/)
- Map integration using Google Maps