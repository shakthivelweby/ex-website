# Popup Component

A reusable modal/popup component built with Headless UI's Dialog component.

## Props

| Prop              | Type      | Default    | Description                                 |
| ----------------- | --------- | ---------- | ------------------------------------------- |
| `isOpen`          | boolean   | required   | Controls whether the popup is displayed     |
| `onClose`         | function  | required   | Function called when the popup should close |
| `title`           | string    | null       | Optional title for the popup                |
| `children`        | ReactNode | required   | Content to display inside the popup         |
| `maxWidth`        | string    | 'max-w-md' | Maximum width of the popup (Tailwind class) |
| `showCloseButton` | boolean   | true       | Whether to show the default close button    |

## Usage Example

```jsx
import { useState } from "react";
import Popup from "@/components/Popup";

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Popup</button>

      <Popup isOpen={isOpen} onClose={() => setIsOpen(false)} title="My Popup">
        <p>This is the popup content.</p>
      </Popup>
    </>
  );
}
```

## Custom Sizes

You can customize the width using the `maxWidth` prop:

```jsx
<Popup
  isOpen={isOpen}
  onClose={closePopup}
  title="Large Popup"
  maxWidth="max-w-2xl"
>
  {/* Content */}
</Popup>
```

## Hiding the Close Button

If you want to implement your own close button or prevent closing:

```jsx
<Popup
  isOpen={isOpen}
  onClose={closePopup}
  title="Custom Controls"
  showCloseButton={false}
>
  <p>Content with custom controls...</p>
  <button onClick={closePopup}>Custom Close</button>
</Popup>
```
