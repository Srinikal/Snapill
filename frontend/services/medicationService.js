import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig';

export const fetchMedications = async () => {
  const userId = auth.currentUser.uid; 
  const medications = [];
  const q = query(collection(db, 'medications'), where('userId', '==', userId));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    medications.push({ id: doc.id, ...doc.data() });
  });

  return medications;
};

export const addMedication = async (medication) => {
  const userId = auth.currentUser.uid;
  await addDoc(collection(db, 'medications'), {
    ...medication,
    userId,
  });
};

export const updateMedication = async (medicationId, updatedData) => {
  const medicationRef = doc(db, 'medications', medicationId);
  await updateDoc(medicationRef, updatedData);
};

export const updateMedicationQuantity = async (medicationId, newQuantity) => {
  const medicationRef = doc(db, 'medications', medicationId);
  await updateDoc(medicationRef, { quantity: newQuantity });
};

export const deleteMedication = async (medicationId) => {
  const medicationRef = doc(db, 'medications', medicationId);
  await deleteDoc(medicationRef);
};