import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

const OnboardingScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text variant="headlineMedium">Welcome to FitMatch</Text>
    <Text style={styles.subtext}>Find gym partners that match your vibe</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Questionnaire')} style={styles.button}>
      Get Started
    </Button>
  </View>
);

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  subtext: { marginVertical: 20, textAlign: 'center' },
  button: { marginTop: 20, width: '80%' },
});

// Sign-Up Screen
const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Profile');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};
