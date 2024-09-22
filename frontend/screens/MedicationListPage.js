import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Button, Menu, IconButton } from 'react-native-paper';
import { fetchMedications, deleteMedication, updateMedicationQuantity } from '../services/medicationService';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

export default function MedicationListPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    if (isFocused) {
      loadMedications();
    }
  }, [isFocused]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const meds = await fetchMedications();
      setMedications(meds);
      setLoading(false);
      scheduleNotificationsForMedications(meds);
    } catch (error) {
      Alert.alert('Error', 'Failed to load medications');
      setLoading(false);
    }
  };

  const scheduleNotification = async (time, medicationName) => {
    const now = new Date();
    const [hour, minute] = time.split(':');
    const notificationTime = new Date();
    notificationTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

    if (notificationTime < now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication Reminder',
        body: `It's time to take your medication: ${medicationName}`,
      },
      trigger: {
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
        repeats: true,
      },
    });
  };

  const scheduleNotificationsForMedications = async (medications) => {
    for (const medication of medications) {
      for (const time of medication.reminderTimes) {
        await scheduleNotification(time, medication.name);
      }
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedication(id);
              Alert.alert('Success', 'Medication deleted successfully');
              loadMedications();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete medication');
            }
          },
        },
      ]
    );
  };

  const handleSwipeLeft = async (medication) => {
    const newQuantity = medication.quantity - 1;

    if (newQuantity < 0) {
      Alert.alert('No pills left', `You have no more pills left for ${medication.name}.`);
      return;
    }

    try {
      await updateMedicationQuantity(medication.id, newQuantity);
      setMedications((prevMedications) =>
        prevMedications.map((med) =>
          med.id === medication.id ? { ...med, quantity: newQuantity } : med
        )
      );
      Alert.alert('Pill Taken', `You took a pill of ${medication.name}. Quantity now: ${newQuantity}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update medication quantity.');
    }
  };

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const renderRightActions = (id) => (
    <View style={styles.deleteButton}>
      <IconButton
        icon="delete"
        color="white"
        onPress={() => handleDelete(id)}
      />
    </View>
  );

  const renderLeftActions = (medication) => (
    <View style={styles.takePillButton}>
      <IconButton
        icon="pill"
        color="white"
        onPress={() => handleSwipeLeft(medication)}
      />
    </View>
  );

  const handleChatPress = (medication) => {
    navigation.navigate('Chat', { medication });
  };

  const handleVanguardPress = () => {
    navigation.navigate('PillVanguard', { medications });
  };

  const renderMedication = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      renderLeftActions={() => renderLeftActions(item)}
      onSwipeableRightOpen={() => handleDelete(item.id)}
      onSwipeableLeftOpen={() => handleSwipeLeft(item)}
    >
      <View style={styles.medicationItem}>
        <View style={styles.medicationTextContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail">Dosage: {item.dosage}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail">Instructions: {item.instructions}</Text>
          <Text>Quantity: {item.quantity}</Text>
          <Text>Reminder Times: {item.reminderTimes.join(', ')}</Text>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            onPress={() => navigation.navigate('UpdateMedication', { medication: item })}
            color="blue"
          />
          <IconButton
            icon="message"
            onPress={() => handleChatPress(item)}
            color="green"
          />
        </View>
      </View>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['white', 'white']}
        style={styles.background}
      >
        <View style={styles.diagonalStripe} />
        <FlatList
          data={medications}
          renderItem={renderMedication}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text>No medications found</Text>}
        />

        <Button
          mode="contained"
          onPress={handleVanguardPress}
          style={styles.vanguardButton}
        >
          Pill Vanguard
        </Button>

        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button
              mode="contained"
              onPress={openMenu}
              style={styles.addButton}
            >
              Add Medication
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              closeMenu();
              navigation.navigate('VideoCapture');
            }}
            title="Take Video"
          />
          <Menu.Item
            onPress={() => {
              closeMenu();
              navigation.navigate('AddMedication');
            }}
            title="Manually Create"
          />
        </Menu>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  diagonalStripe: {
    position: 'absolute',
    top: -300,
    left: '30%',
    width: '60%',
    height: '150%',
    backgroundColor: '#FFA500', // Vial Orange
    transform: [{ rotate: '-45deg' }],
    zIndex: -1,
  },
  medicationItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicationTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '92%',
    borderRadius: 10,
  },
  takePillButton: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '92%',
    borderRadius: 10,
  },
  vanguardButton: {
    marginTop: 20,
    backgroundColor: '#000',
  },
  addButton: {
    marginTop: 10,
    marginBottom: 60,
    backgroundColor: '#000',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});