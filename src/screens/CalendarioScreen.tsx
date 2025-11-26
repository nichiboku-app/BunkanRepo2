import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

type CalendarEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string | null; // HH:mm
  reminderMinutes?: number | null;
  isGlobal?: boolean;
};

const WUONG_SOUND = require('../../assets/audio/wuong.mp3');

// 👇 UID del admin real (nosferatum963)
const ADMIN_UID = '6cvsTORtR3ShBN7ZCLlBjAkSo3p1';

export default function CalendarioScreen() {
  const uid = auth.currentUser?.uid;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [globalEvents, setGlobalEvents] = useState<CalendarEvent[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(''); // HH:mm
  const [timeDate, setTimeDate] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [reminderMinutes, setReminderMinutes] = useState<
    '0' | '5' | '10' | '30' | '60'
  >('30');
  const [asGlobal, setAsGlobal] = useState(false);

  const [sendSound, setSendSound] = useState<Audio.Sound | null>(null);

  // 🔔 Banner simple en la parte superior
  const [bannerVisible, setBannerVisible] = useState(false);

  const isAdminUser = uid === ADMIN_UID;

  // ========= Notificaciones =========
  useEffect(() => {
    // Handler global para notificaciones: dejamos que el SO muestre su alerta.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, // el sistema muestra la notificación
        shouldPlaySound: false, // el sonido custom lo ponemos nosotros
        shouldSetBadge: false,
      }),
    });

    // Listener cuando llega una notificación con la app en primer plano
    const sub = Notifications.addNotificationReceivedListener(async () => {
      try {
        // 1) reproducir wuong.mp3
        if (!sendSound) {
          const { sound } = await Audio.Sound.createAsync(WUONG_SOUND);
          setSendSound(sound);
          await sound.replayAsync();
        } else {
          await sendSound.replayAsync();
        }
      } catch (e) {
        console.warn('Error reproduciendo wuong.mp3', e);
      }

      // 2) mostrar banner negro genérico dentro de la app
      setBannerVisible(true);
      setTimeout(() => {
        setBannerVisible(false);
      }, 4000);
    });

    return () => {
      sub.remove();
      if (sendSound) {
        sendSound.unloadAsync().catch(() => {});
      }
    };
  }, [sendSound]);

  // Pedir permisos de notificación
  useEffect(() => {
    const requestPerms = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.warn('Permiso de notificaciones denegado');
        }
      }
    };
    requestPerms();
  }, []);

  // ========= Escuchar eventos personales =========
  useEffect(() => {
    if (!uid) return;
    const ref = collection(db, 'Usuarios', uid, 'calendarEvents');
    const q = query(ref, orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: CalendarEvent[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          title: data.title ?? '',
          date: data.date,
          time: data.time ?? null,
          reminderMinutes: data.reminderMinutes ?? null,
          isGlobal: false,
        };
      });
      setEvents(list);
    });
    return unsub;
  }, [uid]);

  // ========= Escuchar eventos globales =========
  useEffect(() => {
    const ref = collection(db, 'calendarGlobal');
    const q = query(ref, orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: CalendarEvent[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          title: data.title ?? '',
          date: data.date,
          time: data.time ?? null,
          reminderMinutes: data.reminderMinutes ?? null,
          isGlobal: true,
        };
      });
      setGlobalEvents(list);
    });
    return unsub;
  }, []);

  // Eventos del día seleccionado (personales + global)
  const eventsForSelectedDay = useMemo(() => {
    const all = [...events, ...globalEvents];
    return all.filter((ev) => ev.date === selectedDate);
  }, [events, globalEvents, selectedDate]);

  // Fecha seleccionada como objeto y textos japoneses
  const selectedDateObj = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  const weekdayJp = ['日', '月', '火', '水', '木', '金', '土'];
  const weekdayIndex = selectedDateObj.getDay();
  const weekdayKanji = weekdayJp[weekdayIndex];

  const isToday = (() => {
    const today = new Date();
    const t = today.toISOString().slice(0, 10);
    return t === selectedDate;
  })();

  const formattedJpDate = useMemo(() => {
    const y = selectedDateObj.getFullYear();
    const m = selectedDateObj.getMonth() + 1;
    const d = selectedDateObj.getDate();
    return `${y}年 ${m}月 ${d}日 (${weekdayKanji})`;
  }, [selectedDateObj, weekdayKanji]);

  // Marcar días con puntitos
  const markedDates = useMemo(() => {
    const marks: any = {};
    const all = [...events, ...globalEvents];
    all.forEach((ev) => {
      if (!marks[ev.date]) {
        marks[ev.date] = { marked: true, dots: [] };
      }
    });
    // resaltar seleccionado
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: '#B80C1F',
      selectedTextColor: '#fff',
    };
    return marks;
  }, [events, globalEvents, selectedDate]);

  // ========= Handler del time picker =========
  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    const current = selected || new Date();
    setTimeDate(current);
    const h = current.getHours();
    const m = current.getMinutes();
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    setTime(`${hh}:${mm}`);

    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }
  };

  // ========= Crear evento (personal o global) =========
  const handleSaveEvent = async () => {
    if (!uid) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert(
        'Título requerido',
        'Por favor escribe un título para el evento.'
      );
      return;
    }

    const reminder = parseInt(reminderMinutes, 10);

    try {
      if (asGlobal && isAdminUser) {
        // 👉 1) Guardar evento GLOBAL (lo ven todos en el calendario)
        await addDoc(collection(db, 'calendarGlobal'), {
          title: trimmedTitle,
          date: selectedDate,
          time: time || null,
          reminderMinutes: reminder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // 👉 2) Crear NOTIFICACIÓN GLOBAL para todos
        const previewText = time
          ? `Nuevo evento: ${trimmedTitle} el ${selectedDate} a las ${time}`
          : `Nuevo evento: ${trimmedTitle} el ${selectedDate}`;

        await addDoc(collection(db, 'notificationsGlobal'), {
          actorId: uid,
          actorName: 'Administración Bunkan', // texto que verán los alumnos
          actorAvatar: null,
          type: 'calendar',
          source: 'calendar',
          preview: previewText,
          createdAt: serverTimestamp(),
          read: false,
        });
      } else {
        // Evento personal
        await addDoc(collection(db, 'Usuarios', uid, 'calendarEvents'), {
          title: trimmedTitle,
          date: selectedDate,
          time: time || null,
          reminderMinutes: reminder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Programar notificación local si hay recordatorio (>0)
      if (reminder > 0) {
        await scheduleLocalNotification(
          trimmedTitle,
          selectedDate,
          time || null,
          reminder
        );
      }

      setModalVisible(false);
      setTitle('');
      setTime('');
      setTimeDate(null);
      setReminderMinutes('30');
      setAsGlobal(false);
    } catch (e) {
      console.warn('Error guardando evento', e);
      Alert.alert('Error', 'No se pudo guardar el evento.');
    }
  };

  // ========= Programar notificación local (en el dispositivo del usuario actual) =========
  const scheduleLocalNotification = async (
    title: string,
    date: string,
    time: string | null,
    reminderMinutes: number
  ) => {
    try {
      const [year, month, day] = date.split('-').map((n) => parseInt(n, 10));
      let hours = 9;
      let minutes = 0;
      if (time) {
        const [h, m] = time.split(':').map((n) => parseInt(n, 10));
        hours = h;
        minutes = m;
      }

      // Fecha del evento
      const eventDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      // Recordatorio X minutos antes
      const triggerDate = new Date(
        eventDate.getTime() - reminderMinutes * 60 * 1000
      );

      if (triggerDate.getTime() <= Date.now()) {
        console.log(
          'La hora del recordatorio ya pasó, no se programa notificación.'
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio',
          body: title,
          sound: 'default', // sonido del SO; el wuong lo reproducimos en foreground
        },
        trigger: triggerDate,
      });
    } catch (e) {
      console.warn('Error programando notificación local', e);
    }
  };

  // ========= Eliminar eventos pasados =========
  const deletePastEvents = async () => {
    try {
      Alert.alert(
        'Eliminar eventos pasados',
        '¿Seguro que deseas borrar todos los eventos cuya fecha ya pasó?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const now = new Date();

              // 1) Borrar eventos personales
              if (uid) {
                const ref = collection(db, 'Usuarios', uid, 'calendarEvents');
                const q = query(ref);
                const snap = await getDocs(q);

                for (const docSnap of snap.docs) {
                  const data: any = docSnap.data();
                  const [y, m, d] = data.date.split('-').map(Number);
                  let hours = 23;
                  let minutes = 59;

                  if (data.time) {
                    const [h, mm] = data.time.split(':').map(Number);
                    hours = h;
                    minutes = mm;
                  }

                  const eventDate = new Date(y, m - 1, d, hours, minutes);

                  if (eventDate < now) {
                    await deleteDoc(docSnap.ref);
                  }
                }
              }

              // 2) Borrar eventos globales (solo admin)
              if (isAdminUser) {
                const refG = collection(db, 'calendarGlobal');
                const qG = query(refG);
                const snapG = await getDocs(qG);

                for (const docSnap of snapG.docs) {
                  const data: any = docSnap.data();
                  const [y, m, d] = data.date.split('-').map(Number);

                  let hours = 23;
                  let minutes = 59;

                  if (data.time) {
                    const [h, mm] = data.time.split(':').map(Number);
                    hours = h;
                    minutes = mm;
                  }

                  const eventDate = new Date(y, m - 1, d, hours, minutes);

                  if (eventDate < now) {
                    await deleteDoc(docSnap.ref);
                  }
                }
              }

              Alert.alert('Listo', 'Se eliminaron todos los eventos pasados.');
            },
          },
        ]
      );
    } catch (e) {
      console.warn('Error eliminando eventos pasados', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔔 Banner negro tipo aviso dentro de la app */}
      {bannerVisible && (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Recordatorio</Text>
          <Text style={styles.bannerBody}>
            Tienes un evento en tu calendario.
          </Text>
        </View>
      )}

      {/* HEADER estilo Bunkan */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitleJp}>カレンダー</Text>
          <Text style={styles.headerTitle}>Calendario Bunkan</Text>
          <Text style={styles.headerSubtitle}>
            Organiza tus estudios y eventos importantes.
          </Text>
        </View>
        <View style={styles.headerStamp}>
          <Text style={styles.stampMain}>文</Text>
          <Text style={styles.stampSub}>Bunkan</Text>
        </View>
      </View>

      {/* TARJETA DE FECHA SELECCIONADA */}
      <View style={styles.dateCard}>
        <View style={styles.dateLeft}>
          <Text style={styles.dateDayNumber}>
            {selectedDateObj.getDate().toString().padStart(2, '0')}
          </Text>
          <Text style={styles.dateWeekJp}>{weekdayKanji}曜日</Text>
        </View>
        <View style={styles.dateRight}>
          <Text style={styles.dateJpText}>{formattedJpDate}</Text>
          <Text style={styles.dateInfoText}>
            {isToday ? 'Hoy · 今日' : 'Fecha seleccionada'}
          </Text>
        </View>
      </View>

      {/* CALENDARIO */}
      <View style={styles.calendarWrapper}>
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          monthFormat={'yyyy年 MMMM'}
          hideExtraDays
          firstDay={1}
          markedDates={markedDates}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            selectedDayBackgroundColor: '#B80C1F',
            selectedDayTextColor: '#fff',
            todayTextColor: '#B80C1F',
            arrowColor: '#B80C1F',
            monthTextColor: '#222',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textSectionTitleColor: '#999',
            dayTextColor: '#222',
            textDayFontSize: 14,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      {/* EVENTOS DEL DÍA */}
      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeaderRow}>
          <View>
            <Text style={styles.eventsTitle}>Eventos del día</Text>
            <Text style={styles.eventsSubtitle}>
              Tus recordatorios y eventos globales.
            </Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            {/* Botón eliminar pasados */}
            <TouchableOpacity
              style={styles.deletePastButton}
              onPress={deletePastEvents}
            >
              <Text style={styles.deletePastButtonText}>🗑️</Text>
            </TouchableOpacity>

            {/* Botón agregar */}
            <TouchableOpacity
              style={[styles.addButton, { marginLeft: 6 }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {eventsForSelectedDay.length === 0 ? (
          <Text style={styles.emptyEventsText}>
            No hay eventos para este día.{'\n'}Toca 「＋」 para agregar uno nuevo.
          </Text>
        ) : (
          eventsForSelectedDay.map((ev) => (
            <View
              key={ev.id}
              style={[
                styles.eventCard,
                ev.isGlobal && styles.globalEventCard,
              ]}
            >
              <View style={styles.eventAccent} />
              <View style={styles.eventContent}>
                <View style={styles.eventRowTop}>
                  <View style={styles.eventChipsRow}>
                    {ev.isGlobal && (
                      <View style={styles.chipGlobal}>
                        <Text style={styles.chipGlobalText}>Global</Text>
                      </View>
                    )}
                    {ev.reminderMinutes ? (
                      <View style={styles.chipReminder}>
                        <Text style={styles.chipReminderText}>
                          ⏰ {ev.reminderMinutes} min antes
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.eventTimeText}>
                    {ev.time ? ev.time : 'Todo el día'}
                  </Text>
                </View>

                <Text style={styles.eventTitle}>{ev.title}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* MODAL NUEVO EVENTO */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo evento</Text>
            <Text style={styles.modalDateLabel}>{formattedJpDate}</Text>

            <TextInput
              style={styles.input}
              placeholder="Título del evento (ej. Examen N5, Clase de kanji…)"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />

            {/* Picker de hora */}
            <TouchableOpacity
              style={styles.input}
              activeOpacity={0.8}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.timeText, !time && { color: '#999' }]}>
                {time
                  ? `Hora: ${time}`
                  : 'Hora (opcional) – todo el día si lo dejas vacío'}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={timeDate || new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={handleTimeChange}
              />
            )}

            <View className="row" style={styles.row}>
              <Text style={styles.label}>Recordatorio</Text>
              <View style={styles.reminderRow}>
                {(['0', '5', '10', '30', '60'] as const).map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.reminderChip,
                      reminderMinutes === val && styles.reminderChipActive,
                    ]}
                    onPress={() => setReminderMinutes(val)}
                  >
                    <Text
                      style={[
                        styles.reminderChipText,
                        reminderMinutes === val &&
                          styles.reminderChipTextActive,
                      ]}
                    >
                      {val === '0' ? 'Sin recordatorio' : `${val} min antes`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {isAdminUser && (
              <View style={styles.row}>
                <Text style={styles.label}>Tipo de evento</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      !asGlobal && styles.typeChipActive,
                    ]}
                    onPress={() => setAsGlobal(false)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        !asGlobal && styles.typeChipTextActive,
                      ]}
                    >
                      Personal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeChip, asGlobal && styles.typeChipActive]}
                    onPress={() => setAsGlobal(true)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        asGlobal && styles.typeChipTextActive,
                      ]}
                    >
                      Global (todos)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEvent}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F3F1' },

  // 🔔 Banner negro tipo notificación
  banner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 35 : 60,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bannerBody: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 2,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleJp: {
    fontSize: 18,
    color: '#B80C1F',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A5A5A',
    marginTop: 3,
  },
  headerStamp: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#B80C1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampMain: {
    fontSize: 20,
    color: '#B80C1F',
    fontWeight: '800',
  },
  stampSub: {
    fontSize: 8,
    color: '#B80C1F',
    marginTop: -2,
  },

  // TARJETA FECHA
  dateCard: {
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dateLeft: {
    marginRight: 16,
    alignItems: 'center',
  },
  dateDayNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#B80C1F',
  },
  dateWeekJp: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  dateRight: {
    flex: 1,
  },
  dateJpText: {
    fontSize: 14,
    color: '#2A1A1A',
    fontWeight: '700',
  },
  dateInfoText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  // CALENDARIO
  calendarWrapper: {
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  eventsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  eventsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  eventsSubtitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#B80C1F',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  deletePastButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#D11A2A',
  },
  deletePastButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyEventsText: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Tarjetas de evento
  eventCard: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  globalEventCard: {
    borderWidth: 1,
    borderColor: '#B80C1F55',
  },
  eventAccent: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    backgroundColor: '#B80C1F',
  },
  eventContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  eventRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  eventChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipGlobal: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FCE6EA',
    marginRight: 4,
  },
  chipGlobalText: {
    fontSize: 11,
    color: '#B80C1F',
    fontWeight: '700',
  },
  chipReminder: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F2F2F2',
  },
  chipReminderText: {
    fontSize: 11,
    color: '#555',
  },
  eventTimeText: {
    fontSize: 12,
    color: '#555',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  modalDateLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 10,
    fontSize: 14,
    color: '#222',
  },
  timeText: {
    fontSize: 14,
    color: '#222',
  },
  row: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reminderChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 6,
    marginBottom: 4,
  },
  reminderChipActive: {
    backgroundColor: '#B80C1F',
    borderColor: '#B80C1F',
  },
  reminderChipText: {
    fontSize: 12,
    color: '#555',
  },
  reminderChipTextActive: {
    color: '#FFF',
  },

  typeRow: {
    flexDirection: 'row',
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 6,
  },
  typeChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  typeChipText: {
    fontSize: 12,
    color: '#555',
  },
  typeChipTextActive: {
    color: '#FFF',
  },

  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
  },
  cancelText: {
    fontSize: 13,
    color: '#555',
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#B80C1F',
  },
  saveText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
});
