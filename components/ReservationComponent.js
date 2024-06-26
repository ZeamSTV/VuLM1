import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Text, Switch, Button, Alert,Platform  } from 'react-native';
import { Icon } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import * as Animatable from 'react-native-animatable';
import * as Notifications from 'expo-notifications';
import * as  Calendar  from 'expo-calendar';
class ModalContent extends Component {
    render() {
        return (
            <View style={styles.modal}>
                <Text style={styles.modalTitle}>Your Reservation</Text>
                <Text style={styles.modalText}>Number of Guests: {this.props.guests}</Text>
                <Text style={styles.modalText}>Smoking?: {this.props.smoking ? 'Yes' : 'No'}</Text>
                <Text style={styles.modalText}>Date and Time: {format(this.props.date, 'dd/MM/yyyy - HH:mm')}</Text>
                <Button title='Close' color='#7cc' onPress={() => this.props.onPressClose()} />
            </View>
        );
    }
}
class Reservation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            guests: 1,
            smoking: false,
            date: new Date(),
            showDatePicker: false,
            showModal: false
        }
    }
    resetForm() {
        this.setState({
            guests: 1,
            smoking: false,
            date: new Date(),
            showDatePicker: false,
            showModal: false
        });
    }

    render() {
        return (
            <Animatable.View animation='zoomIn' duration={2000}>
                <ScrollView>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Number of Guests</Text>
                        <Picker style={styles.formItem} selectedValue={this.state.guests} onValueChange={(value) => this.setState({ guests: value })}>
                            <Picker.Item label='1' value='1' />
                            <Picker.Item label='2' value='2' />
                            <Picker.Item label='3' value='3' />
                            <Picker.Item label='4' value='4' />
                            <Picker.Item label='5' value='5' />
                            <Picker.Item label='6' value='6' />
                        </Picker>
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Smoking/No-Smoking?</Text>
                        <Switch style={styles.formItem} value={this.state.smoking} onValueChange={(value) => this.setState({ smoking: value })} />
                    </View>
                    <View style={styles.formRow}>
                        <Text style={styles.formLabel}>Date and Time</Text>
                        <Icon name='schedule' size={36} onPress={() => this.setState({ showDatePicker: true })} />
                        <Text style={{ marginLeft: 10 }}>{format(this.state.date, 'dd/MM/yyyy - HH:mm')}</Text>
                        <DateTimePickerModal mode='datetime' isVisible={this.state.showDatePicker}
                            onConfirm={(date) => this.setState({ date: date, showDatePicker: false })}
                            onCancel={() => this.setState({ showDatePicker: false })} />
                    </View>
                    <View style={styles.formRow}>
                        <Button title='Reserve' color='#7cc' onPress={() => this.handleReservation()} />
                    </View>
                </ScrollView>
            </Animatable.View>
        );
    }
    async handleReservation() {
        // alert(JSON.stringify(this.state));
        // this.setState({ showModal: true });
        const { guests, smoking, date } = this.state;
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status === 'granted') {
                const defaultCalendarSource = Platform.OS === 'ios' ? await Calendar.getDefaultCalendarAsync() : { isLocalAccount: true, name: 'Expo Calendar' };
                const newCalendarID = await Calendar.createEventAsync(
                    defaultCalendarSource.id,
                    {
                        title: 'Con Fusion Table Reservation',
                        startDate: date,
                        endDate: new Date(date.getTime() + (2 * 60 * 60 * 1000)), // Assuming reservation lasts for 2 hours
                        timeZone: 'Asia/Hong_Kong',
                        availability: 'busy',
                        location: '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong',        
                        accessLevel: 'owner',
                        details: `Number of Guests: ${guests}\nSmoking?: ${smoking ? 'Yes' : 'No'}`,
                    }
                );
                console.log(`Event created in calendar with ID: ${newCalendarID}`);
            } else {
                console.log('Calendar permission not granted');
            }
        } catch (error) {
            console.error('Error creating event in calendar:', error);
        }
        Alert.alert(
            'Your Reservation OK?',
            `Number of Guests: ${this.state.guests}\nSmoking?: ${this.state.smoking ? 'Yes' : 'No'}\nDate and Time: ${format(this.state.date, 'dd/MM/yyyy - HH:mm')}`,
            [
                {
                    text: 'Cancel',
                    onPress: () => this.resetForm(),
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: () => {
                        this.presentLocalNotification(this.state.date);
                        this.resetForm();
                      }
                }
            ],
            { cancelable: false }
        );
    }
    async presentLocalNotification(date) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true })
          });
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Your Reservation',
              body: 'Reservation for ' + date + ' requested',
              sound: true,
              vibrate: true
            },
            trigger: null
          });
        }
      }
}

export default Reservation;

const styles = StyleSheet.create({
    formRow: { alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', margin: 20 },
    formLabel: { fontSize: 18, flex: 2 },
    formItem: { flex: 1 },
    modal: { justifyContent: 'center', margin: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', backgroundColor: '#7cc', textAlign: 'center', color: 'white', marginBottom: 20 },
    modalText: { fontSize: 18, margin: 10 }
});