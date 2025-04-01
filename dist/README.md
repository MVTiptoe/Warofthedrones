# DroneWars Game

A React Three Fiber-based game with enemy units, damage system, and interactive weapons.

## Features

- **BaseUnit System**: A foundational component for all game units with health management and damage handling
- **Vehicle Types**: Tanks, Jeeps, and APCs with distinct models and properties
- **Soldier Types**: Infantry, Medics, and Snipers with unique appearances
- **Weapon System**: Multiple weapon types with different damage profiles and visual effects
- **Health System**: Units react to damage with movement limitations and visual effects
- **Respawn Mechanics**: Destroyed units respawn after 5 seconds

## Health & Damage Mechanics

- **Soldiers**: 10 health points
- **Vehicles**: 20 health points
- Health thresholds:
  - At 50% health: Units can't move
  - At 25% health: Units start burning
  - At 0% health: Units die and respawn after 5 seconds

## Weapon System

The game includes multiple weapon types:
- **Anti-tank Mine**: Stationary explosive with high vehicle damage
- **RPG**: Rocket-propelled grenade with area effect
- **Mortar**: Indirect fire weapon
- **Grenade**: Hand-thrown explosive
- **Dart**: Precision projectile
- **Shotgun**: Close-range weapon

Each weapon has:
- Primary damage zone with maximum effect
- Secondary damage zone with falloff effect
- Visual effects based on weapon type

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/DroneWars.git
cd DroneWars
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

## Usage

The demo scene includes:
- Various enemy units (vehicles and soldiers)
- Weapon selection interface
- Score tracking
- Interactive camera controls

Click on a weapon to fire it at a predefined location. Observe how different units respond to damage based on their health thresholds.

## Component Structure

- **BaseUnit**: Core component that handles health, damage, and status effects
- **Vehicle & Soldier**: Extend BaseUnit with type-specific properties and visuals
- **Vehicles & Soldiers**: Manage collections of their respective unit types
- **WeaponDamage**: Defines weapon properties and damage calculations
- **WeaponEffects**: Handles visual effects for weapon impacts
- **EnemyManager**: Coordinates all enemy units and their interactions

## Code Organization

The DroneWars codebase follows a modular organization pattern to improve maintainability and code readability:

### Directory Structure

```
src/
├── components/      # All React components
│   ├── effects/     # Visual effects components
│   ├── weapons/     # Weapon-related components
│   └── ...          # Other game components
├── utils/           # Utility functions and helpers
│   ├── weapons/     # Weapon-specific utilities
│   └── ...          # Other utilities
├── styles/          # CSS and styling files
└── scripts/         # Game scripts and logic
```

### Key Components

1. **GameScene.jsx** - Main game scene component that orchestrates the game
2. **WeaponEffects.jsx** - Manages all weapon effects, projectiles, and impacts
3. **ExplosionEffect.jsx** - Dedicated component for explosion visuals
4. **Mine.jsx** - Component for placing and managing mines

### Utils

1. **WeaponDamage.js** - Contains damage calculations and weapon configuration

### Best Practices

- Each component should focus on a single responsibility
- Keep files under 300 lines where possible, split larger files
- Use consistent naming conventions
- Use React.forwardRef for components that need to expose methods
- Keep state management close to where it's used
- Avoid direct DOM manipulation in React components when possible
- Use proper imports with correct paths

### Adding New Features

When adding new features:

1. Decide if it belongs in an existing component or needs a new one
2. Place it in the appropriate directory
3. Export it properly
4. Import it where needed
5. Follow the established patterns in the codebase

## License

This project is licensed under the MIT License - see the LICENSE file for details. 