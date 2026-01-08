# UX Shell

A modern, responsive UI shell prototype built with React, TypeScript, and Tailwind CSS. Features a collapsible sidebar navigation, draggable tabs, and styling matched to Figma designs.

## Features

- **Sidebar Navigation**: Expandable/collapsible/minimizable sidebar with flyout panels
- **Tab Management**: Draggable tabs with overflow handling
- **Figma-Matched Styling**: UI components styled to match Figma design specifications
- **State Management**: Zustand stores for sidebar and tab state
- **Responsive Design**: Adapts to different sidebar states

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Radix UI (component primitives)
- DnD Kit (drag and drop)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── sidebar/        # Sidebar navigation components
│   ├── tabs/           # Tab bar components
│   └── ui/             # Reusable UI components
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## License

Private project

