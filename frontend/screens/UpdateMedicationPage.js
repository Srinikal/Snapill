import React, { useState } from 'react';
import { View, Alert, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateMedication } from '../services/medicationService';
import { useNavigation } from '@react-navigation/native';

export default function UpdateMedicationPage({ route }) {
  const { medication } = route.params;

  // Ensure reminderTimes is always initialized as an array
  const [reminderTimes, setReminderTimes] = useState(
    Array.isArray(medication.reminderTime) ? medication.reminderTime : []
  );

  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [instructions, setInstructions] = useState(medication.instructions);
  const [quantity, setQuantity] = useState(medication.quantity.toString());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(null); // Temporary time before confirming
  const navigation = useNavigation();

  const handleAddReminderTime = () => {
    setShowTimePicker(true);
  };

  const handleTimePicked = (event, date) => {
    if (date) {
      setTempTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const confirmTime = () => {
    if (tempTime) {
      setReminderTimes([...reminderTimes, tempTime]);
      setTempTime(null);
      setShowTimePicker(false);
    }
  };

  const handleRemoveReminderTime = (time) => {
    setReminderTimes(reminderTimes.filter(t => t !== time));
  };

  const handleUpdateMedication = async () => {
    if (!name || !dosage || !quantity || reminderTimes.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateMedication(medication.id, {
        name,
        dosage,
        instructions,
        quantity: Number(quantity),
        reminderTimes,
      });
      Alert.alert('Success', 'Medication updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        label="Medication Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Dosage"
        value={dosage}
        onChangeText={setDosage}
        style={styles.input}
      />
      <TextInput
        label="Instructions"
        value={instructions}
        onChangeText={setInstructions}
        style={styles.input}
      />
      <TextInput
        label="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
      />
      <View style={styles.reminderTimesBox}>
        <Text style={styles.label}>Reminder Times</Text>
        <View style={styles.chipContainer}>
          {reminderTimes.map((time, index) => (
            <Chip
              key={index}
              onClose={() => handleRemoveReminderTime(time)}
              style={styles.chip}
            >
              {time}
            </Chip>
          ))}
        </View>

        <TouchableOpacity onPress={handleAddReminderTime} style={styles.addTimeButton}>
          <Text style={styles.addTimeButtonText}>+ Add Time</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={handleTimePicked}
          />
        )}

        {tempTime && (
          <View style={styles.confirmButtonContainer}>
            <Text style={styles.selectedTimeText}>Selected Time: {tempTime}</Text>
            <Button mode="contained" onPress={confirmTime} style={styles.confirmButton}>
              Confirm Time
            </Button>
          </View>
        )}
      </View>

      <Button
        mode="contained"
        onPress={handleUpdateMedication}
        style={styles.submitButton}
      >
        Update Medication
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#F0F0F0',
  },
  reminderTimesBox: {
    marginBottom: 20,
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 5,
    marginBottom: 5,
  },
  addTimeButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addTimeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonContainer: {
    marginTop: 10,
  },
  selectedTimeText: {
    fontSize: 16,
    marginBottom: 5,
  },
  confirmButton: {
    backgroundColor: '#007BFF',
  },
  submitButton: {
    backgroundColor: '#000',
  },
});