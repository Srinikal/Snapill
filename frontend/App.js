
import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper'; // Import the Provider from react-native-paper
import LoginPage from './screens/LoginPage';  // Import the login screen
import MedicationListPage from './screens/MedicationListPage';  // Import the medication list screen
import AddMedicationPage from './screens/AddMedicationPage';  // Import the add medication screen
import UpdateMedicationPage from './screens/UpdateMedicationPage';  // Import the update medication screen
import VideoCapturePage from './screens/VideoCapturePage';  // Import the video capture page
import LoadingPage from './screens/LoadingPage';
import ChatPage from './screens/ChatPage';
import PillVanguard from './screens/PillVanguardPage'
import { enableScreens } from 'react-native-screens';
const Stack = createStackNavigator();

enableScreens();
export default function App() {

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">        
          <Stack.Screen 
            name="Login" 
            component={LoginPage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Medications" 
            component={MedicationListPage} 
            options={{ title: 'Your Medications' }}
          />
          <Stack.Screen 
            name="AddMedication" 
            component={AddMedicationPage} 
            options={{ title: 'Add Medication' }} 
          />
          <Stack.Screen 
            name="UpdateMedication" 
            component={UpdateMedicationPage} 
            options={{ title: 'Update Medication' }}
          />
          <Stack.Screen 
            name="VideoCapture" 
            component={VideoCapturePage} 
            options={{ title: 'Capture Video' }}
          />
          <Stack.Screen name="Loading" component={LoadingPage} options={{ title: 'Processing...' }}/>
          <Stack.Screen name="Chat" component={ChatPage}/>
          <Stack.Screen name="PillVanguard" component={PillVanguard}/>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}