import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { fetchMedications } from '../services/medicationService';
import Markdown from 'react-native-markdown-display';

export default function PillVanguard() {
  const [medications, setMedications] = useState([]);
  const [incompatibilities, setIncompatibilities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const meds = await fetchMedications();
      const medNames = meds.map((med) => med.name);
      setMedications(medNames);
      checkCompatibility(medNames); 
    } catch (error) {
      Alert.alert('Error', 'Failed to load medications');
    }
  };

  const checkCompatibility = async (medNames) => {
    try {
        
        msg = "In a single paragraph, give me a general overview of these drugs." + medNames.join(",");
        const response = await fetch('https://snapill-backend-b37ba101e223.herokuapp.com/vanguard', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: msg }),
        });

      if (response.ok) {
        const data = await response.json();
        setIncompatibilities(data.response);
      } else {
        Alert.alert('Error', 'Failed to check compatibility');
      }
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pill Vanguard: Medication Compatibility</Text>

      <Text style={styles.sectionTitle}>Your Medications</Text>
      {medications.map((med, index) => (
        <Text key={index} style={styles.medText}>{med}</Text>
      ))}

<Markdown style={markdownStyles}>
        {incompatibilities}  
      </Markdown>

      <Button mode="contained" onPress={loadMedications} style={styles.refreshButton}>
        Refresh
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  medText: {
    fontSize: 16,
    marginBottom: 5,
  },
  incompatibilityText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 5,
  },
  noIssuesText: {
    fontSize: 16,
    color: 'green',
    marginTop: 20,
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const markdownStyles = {
heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
},
strong: {
    fontWeight: 'bold',
},
em: {
    fontStyle: 'italic',
},
paragraph: {
    fontSize: 16,
    color: '#555',
},
};