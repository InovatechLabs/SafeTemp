
import React from 'react';
import { Platform, View, Text, Pressable, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export type DateInputProps = {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
};

export default function DateInput({
  value = null,
  onChange,
  mode = 'date',
  placeholder = 'Selecionar data',
  minimumDate,
  maximumDate,
  disabled = false,
}: DateInputProps) {
  const [visible, setVisible] = React.useState(false);

  const show = () => {
    if (!disabled) setVisible(true);
  };
  const hide = () => setVisible(false);

  const handleConfirm = (date: Date) => {
    hide();
    onChange(date);
  };

  // Web: render a native <input type="date"> — this will only run on web builds
  if (Platform.OS === 'web') {
   
    const formatted = value
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
          value.getDate()
        ).padStart(2, '0')}`
      : '';

    return (
      <View style={styles.container}>
        <label style={styles.label}>{placeholder}</label>
        {/* @ts-ignore - JSX input is valid on web builds */}
        <input
          type={mode === 'time' ? 'time' : 'date'}
          value={formatted}
          onChange={(e: any) => {
            const v = e.target.value; // yyyy-mm-dd
            if (!v) return onChange(null);
            if (mode === 'time') {
           
              const [hh, mm] = v.split(':').map(Number);
              const d = new Date();
              d.setHours(hh, mm, 0, 0);
              onChange(d);
            } else {
              const [y, m, day] = v.split('-').map(Number);
              onChange(new Date(y, m - 1, day));
            }
          }}
          min={minimumDate ? `${minimumDate.getFullYear()}-${String(minimumDate.getMonth() + 1).padStart(2, '0')}-${String(minimumDate.getDate()).padStart(2, '0')}` : undefined}
          max={maximumDate ? `${maximumDate.getFullYear()}-${String(maximumDate.getMonth() + 1).padStart(2, '0')}-${String(maximumDate.getDate()).padStart(2, '0')}` : undefined}
          disabled={disabled}
          style={{ padding: 8, fontSize: 16 }}
        />
      </View>
    );
  }

  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{placeholder}</Text>
      <Pressable onPress={show} style={[styles.button, disabled && styles.disabled]} accessibilityRole="button">
        <Text style={styles.buttonText}>{value ? value.toLocaleDateString() : 'Selecionar'}</Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={visible}
        mode={mode === 'datetime' ? 'date' : (mode as 'date' | 'time')}
        date={value || new Date()}
        onConfirm={handleConfirm}
        onCancel={hide}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
