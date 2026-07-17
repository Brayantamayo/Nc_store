import { useRef, useState, useEffect } from 'react';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  value: string;
  onChange: (compositeColor: string) => void;
  placeholder?: string;
}

const NAME_TO_HEX: Record<string, string> = {
  negro: '#1a1a1a', blanco: '#f5f5f5', gris: '#9e9e9e',
  rosado: '#f48fb1', rosa: '#f48fb1', 'rosa fucsia': '#e91e8c',
  fucsia: '#e91e8c', rojo: '#e53935', coral: '#ff7043',
  naranja: '#fb8c00', amarillo: '#fdd835', verde: '#43a047',
  'verde menta': '#80cbc4', azul: '#1e88e5', 'azul cielo': '#81d4fa',
  morado: '#8e24aa', lavanda: '#ce93d8', beige: '#d7b899',
  café: '#6d4c41', cafe: '#6d4c41', dorado: '#ffd54f',
  plateado: '#b0bec5', nude: '#e8c4a0', marron: '#8b4513',
  marrón: '#8b4513',
};

/** Parsea el color guardado en formato "Nombre|#hex" */
const parseValue = (val: string) => {
  const parts = val.split('|');
  if (parts.length === 2) {
    return { name: parts[0].trim(), hex: parts[1].trim() };
  }
  // Fallback si no tiene pipe
  const trimmed = val.trim();
  if (/^#[0-9a-fA-F]{3,6}$/.test(trimmed)) {
    return { name: trimmed, hex: trimmed };
  }
  return { name: trimmed, hex: NAME_TO_HEX[trimmed.toLowerCase()] ?? '#f48fb1' };
};

export const ColorPicker = ({
  value,
  onChange,
  placeholder = 'Nombre visible (ej: Tono 1)',
}: ColorPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Extraemos el nombre y el hex del valor actual
  const parsed = parseValue(value);
  const [name, setName] = useState(parsed.name);
  const [hex, setHex] = useState(parsed.hex);

  // Sincronizar estados cuando cambia el valor desde el padre (ej. al cargar el modal de editar)
  useEffect(() => {
    const updated = parseValue(value);
    setName(updated.name);
    setHex(updated.hex);
  }, [value]);

  // Cuando cambia el picker de color (circulo de color)
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedHex = e.target.value;
    setHex(selectedHex);
    // Guardamos como "Nombre|#hex"
    onChange(`${name.trim() || 'Color'}|${selectedHex}`);
  };

  // Cuando cambia el texto del nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredName = e.target.value;
    setName(enteredName);
    
    // Si el nombre ingresado coincide con un color básico conocido, podemos auto-actualizar el hex
    const knownHex = NAME_TO_HEX[enteredName.toLowerCase().trim()];
    const activeHex = knownHex ?? hex;
    if (knownHex) {
      setHex(knownHex);
    }
    
    onChange(`${enteredName.trim()}|${activeHex}`);
  };

  return (
    <div className={styles.wrapper}>
      {/* Botón de color (swatch clickeable) */}
      <div
        className={styles.swatchBtn}
        style={{ background: hex }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Elegir color visual"
        title="Haz clic para elegir el color con el selector"
      >
        <input
          ref={inputRef}
          type="color"
          className={styles.nativeInput}
          value={hex}
          onChange={handleColorChange}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Input del Nombre (Ej: Tono 1, Fucsia Chic, etc) */}
      <input
        type="text"
        className={styles.nameInput}
        value={name}
        onChange={handleNameChange}
        placeholder={placeholder}
        aria-label="Nombre del color para la tienda"
      />
    </div>
  );
};
