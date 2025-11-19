import { useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    GestureResponderEvent,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    PanResponderGestureState,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';

import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';

import { auth, db } from '../config/firebaseConfig';

// ===== Tipos =====
type StrokePoint = { x: number; y: number };
type Stroke = { color: string; points: StrokePoint[] };

type Note = {
  id: string;
  title: string;
  content: string;
  color: string; // color “tema” de la nota
  createdAt: Date | null;
  updatedAt: Date | null;
  drawing?: Stroke[];
  isVerticalJP?: boolean; // modo cuaderno japonés
};

const NOTE_COLORS = ['#00B894', '#0984E3', '#D63031', '#FDCB6E', '#6C5CE7'];
const PEN_COLORS = ['#000000', '#E84393', '#0984E3', '#00B894', '#FDCB6E'];

function formatDate(d: Date | null) {
  if (!d) return '';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Construye el path SVG desde puntos
function buildPath(points: StrokePoint[]): string {
  if (!points.length) return '';
  const [{ x, y }, ...rest] = points;
  const commands = [`M ${x} ${y}`];
  for (const p of rest) {
    commands.push(`L ${p.x} ${p.y}`);
  }
  return commands.join(' ');
}

// Convierte el texto normal en texto "vertical" (un carácter por línea)
function buildVerticalText(text: string): string {
  if (!text) return '';
  // Respetamos saltos de línea existentes y metemos uno entre cada carácter normal
  const chars = Array.from(text); // maneja bien kanji / emojis
  return chars.join('\n');
}

export default function NotasScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Campos del editor
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);

  // Dibujo
  const [mode, setMode] = useState<'text' | 'draw'>('text');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Modo cuaderno japonés vertical
  const [isVerticalJP, setIsVerticalJP] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const COLUMN_COUNT = 8;

  // Ventana informativa del botón 縦
  const [verticalInfoVisible, setVerticalInfoVisible] = useState(false);

  const uid = auth.currentUser?.uid;

  // Texto convertido a columna vertical
  const verticalText = useMemo(() => buildVerticalText(content), [content]);

  // ===== Escuchar notas del usuario =====
  useEffect(() => {
    if (!uid) return;
    const notesRef = collection(db, 'Usuarios', uid, 'notes');
    const q = query(notesRef, orderBy('updatedAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const list: Note[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          title: data.title ?? '',
          content: data.content ?? '',
          color: data.color ?? NOTE_COLORS[0],
          createdAt: data.createdAt?.toDate?.() ?? null,
          updatedAt: data.updatedAt?.toDate?.() ?? null,
          drawing: data.drawing ?? [],
          isVerticalJP: data.isVerticalJP ?? false,
        };
      });
      setNotes(list);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  // ===== Nueva nota =====
  const handleNewNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setNoteColor(NOTE_COLORS[0]);
    setStrokes([]);
    setPenColor(PEN_COLORS[0]);
    setMode('text');
    setIsVerticalJP(false);
    setEditorVisible(true);
  };

  // ===== Editar nota existente =====
  const handleOpenNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setNoteColor(note.color || NOTE_COLORS[0]);
    setStrokes(note.drawing || []);
    setPenColor(PEN_COLORS[0]);
    setMode('text');
    setIsVerticalJP(!!note.isVerticalJP);
    setEditorVisible(true);
  };

  // ===== Guardar nota =====
  const handleSave = async () => {
    if (!uid) return;
    const trimmedTitle = title.trim() || 'Nota sin título';

    const baseData = {
      title: trimmedTitle,
      content,
      color: noteColor,
      drawing: strokes,
      isVerticalJP,
      updatedAt: serverTimestamp(),
    };

    const notesRef = collection(db, 'Usuarios', uid, 'notes');

    try {
      if (editingNote) {
        const ref = doc(db, 'Usuarios', uid, 'notes', editingNote.id);
        await updateDoc(ref, baseData);
      } else {
        await addDoc(notesRef, {
          ...baseData,
          createdAt: serverTimestamp(),
        });
      }
      setEditorVisible(false);
    } catch (e) {
      console.warn('Error guardando nota', e);
    }
  };

  // ===== Dibujo con el dedo =====
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => mode === 'draw',
        onMoveShouldSetPanResponder: () => mode === 'draw',
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          if (mode !== 'draw') return;
          const { locationX, locationY } = evt.nativeEvent;
          const stroke: Stroke = {
            color: penColor,
            points: [{ x: locationX, y: locationY }],
          };
          currentStrokeRef.current = stroke;
          setStrokes((prev) => [...prev, stroke]);
        },
        onPanResponderMove: (
          evt: GestureResponderEvent,
          _gestureState: PanResponderGestureState
        ) => {
          if (mode !== 'draw') return;
          const { locationX, locationY } = evt.nativeEvent;
          setStrokes((prev) => {
            if (!prev.length) return prev;
            const newArr = [...prev];
            const last = newArr[newArr.length - 1];
            last.points = [...last.points, { x: locationX, y: locationY }];
            return newArr;
          });
        },
        onPanResponderRelease: () => {
          currentStrokeRef.current = null;
        },
        onPanResponderTerminate: () => {
          currentStrokeRef.current = null;
        },
      }),
    [mode, penColor]
  );

  // ===== Toggle de modo vertical japonés con ventana informativa =====
  const handleToggleVerticalJP = () => {
    setIsVerticalJP((prev) => {
      const next = !prev;
      if (!prev) {
        // Se acaba de activar 縦 -> mostramos explicación
        setVerticalInfoVisible(true);
      }
      return next;
    });
  };

  // ===== Render de cada nota (vista bonita) =====
  const renderNoteItem = ({ item }: { item: Note }) => {
    const initial = (item.title || 'N')[0].toUpperCase();
    const preview =
      item.content.trim().length > 0
        ? item.content.trim()
        : 'Toca para abrir esta nota…';

    return (
      <TouchableOpacity
        style={styles.noteWrapper}
        activeOpacity={0.93}
        onPress={() => handleOpenNote(item)}
      >
        <View style={[styles.noteCard, { borderColor: item.color }]}>
          <View style={[styles.noteColorStrip, { backgroundColor: item.color }]} />
          <View style={styles.noteHeaderRow}>
            <View style={[styles.noteAvatar, { backgroundColor: item.color }]}>
              <Text style={styles.noteAvatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.noteTitle} numberOfLines={1}>
                {item.title || 'Nota sin título'}
              </Text>
              <Text style={styles.noteDate}>
                {formatDate(item.updatedAt || item.createdAt)}
              </Text>
            </View>
            {item.isVerticalJP && (
              <View style={styles.jpBadge}>
                <Text style={styles.jpBadgeText}>縦</Text>
              </View>
            )}
          </View>

          <Text style={styles.notePreview} numberOfLines={3}>
            {preview}
          </Text>

          <View style={styles.noteFooterRow}>
            <Text style={styles.noteFooterText}>Mis apuntes</Text>
            <Text style={styles.noteFooterIcon}>✏️</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis apuntes</Text>
          <Text style={styles.headerSubtitle}>
            Tu cuaderno digital para japonés, vocabulario y más.
          </Text>
        </View>

        {/* LISTA DE NOTAS */}
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Tu cuaderno está vacío</Text>
                <Text style={styles.emptyText}>
                  Toca el botón negro (+) para crear tu primera nota.
                </Text>
              </View>
            ) : null
          }
        />

        {/* BOTÓN FLOTANTE + */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewNote}
          activeOpacity={0.9}
        >
          <Text style={styles.fabIcon}>＋</Text>
        </TouchableOpacity>

        {/* EDITOR DE NOTA */}
        <Modal
          visible={editorVisible}
          animationType="slide"
          onRequestClose={() => setEditorVisible(false)}
        >
          <SafeAreaView style={styles.editorContainer}>
            {/* Barra superior */}
            <View style={styles.editorTopBar}>
              <TouchableOpacity onPress={() => setEditorVisible(false)}>
                <Text style={styles.topBarButton}>Cerrar</Text>
              </TouchableOpacity>
              <Text style={styles.editorTopTitle}>
                {editingNote ? 'Editar nota' : 'Nueva nota'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.topBarButton}>Guardar</Text>
              </TouchableOpacity>
            </View>

            {/* Toolbar: modos + colores + japonés */}
            <View style={styles.toolbar}>
              <View style={styles.modeSwitch}>
                {/* Modo texto */}
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'text' && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode('text')}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === 'text' && styles.modeButtonTextActive,
                    ]}
                  >
                    T
                  </Text>
                </TouchableOpacity>

                {/* Modo dibujo */}
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    mode === 'draw' && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode('draw')}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === 'draw' && styles.modeButtonTextActive,
                    ]}
                  >
                    ✏️
                  </Text>
                </TouchableOpacity>

                {/* Modo vertical japonés */}
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    isVerticalJP && styles.modeButtonActive,
                  ]}
                  onPress={handleToggleVerticalJP}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      isVerticalJP && styles.modeButtonTextActive,
                    ]}
                  >
                    縦
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Colores de la tarjeta */}
              <View style={styles.colorRow}>
                {NOTE_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      noteColor === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setNoteColor(c)}
                  />
                ))}
              </View>
            </View>

            {/* Título */}
            <TextInput
              style={styles.titleInput}
              placeholder="Título de la nota"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />

            {/* Contenido de texto */}
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder={
                  isVerticalJP
                    ? 'Escribe aquí tu texto (abajo verás la versión vertical)...'
                    : 'Escribe tus apuntes aquí...'
                }
                placeholderTextColor="#aaa"
                value={content}
                onChangeText={setContent}
                multiline
              />
            </View>

            {/* Vista previa vertical del texto */}
            {isVerticalJP && verticalText.trim().length > 0 && (
              <View style={styles.verticalPreviewBox}>
                <Text style={styles.verticalPreviewLabel}>
                  Vista del texto en escritura vertical japonesa
                </Text>
                <View style={styles.verticalPreviewInner}>
                  <Text style={styles.verticalPreviewText}>{verticalText}</Text>
                </View>
              </View>
            )}

            {/* Barra de herramientas de dibujo */}
            <View style={styles.drawToolbar}>
              <Text style={styles.drawLabel}>
                {isVerticalJP ? 'Dibujo / kanji en vertical' : 'Dibujo a mano'}
              </Text>
              <View style={styles.penColorRow}>
                {PEN_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.penColorDot,
                      { backgroundColor: c },
                      penColor === c && styles.penColorDotSelected,
                    ]}
                    onPress={() => setPenColor(c)}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setStrokes([])}
                style={styles.clearDrawBtn}
              >
                <Text style={styles.clearDrawText}>Borrar dibujo</Text>
              </TouchableOpacity>
            </View>

            {/* Canvas de dibujo */}
            <View
              style={styles.drawingArea}
              onLayout={(e) => setCanvasWidth(e.nativeEvent.layout.width)}
              {...panResponder.panHandlers}
            >
              <Svg style={{ flex: 1 }}>
                {/* Guías verticales para japonés */}
                {isVerticalJP &&
                  canvasWidth > 0 &&
                  Array.from({ length: COLUMN_COUNT }).map((_, i) => {
                    const x = ((i + 0.5) * canvasWidth) / COLUMN_COUNT;
                    return (
                      <Line
                        key={i}
                        x1={x}
                        y1={0}
                        x2={x}
                        y2="100%"
                        stroke="#E5E5E5"
                        strokeWidth={1}
                      />
                    );
                  })}

                {/* Trazos dibujados */}
                {strokes.map((stroke, idx) => (
                  <Path
                    key={idx}
                    d={buildPath(stroke.points)}
                    stroke={stroke.color}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </Svg>

              {mode !== 'draw' && (
                <View style={styles.drawHintOverlay}>
                  <Text style={styles.drawHintText}>
                    {isVerticalJP
                      ? 'Activa ✏️ para practicar kanji en vertical'
                      : 'Activa ✏️ para dibujar con el dedo'}
                  </Text>
                </View>
              )}
            </View>

            {/* Ventana informativa del botón 縦 */}
            <Modal
              visible={verticalInfoVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setVerticalInfoVisible(false)}
            >
              <View style={styles.infoOverlay}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Modo 縦 (tategaki)</Text>
                  <Text style={styles.infoText}>
                    Este modo está pensado para practicar japonés en escritura
                    vertical:
                  </Text>
                  <Text style={styles.infoBullet}>
                    • Tu texto se muestra en una columna, carácter por carácter,
                    como en los libros japoneses.
                  </Text>
                  <Text style={styles.infoBullet}>
                    • El área de dibujo muestra columnas para escribir kanji,
                    hiragana y katakana de arriba hacia abajo.
                  </Text>
                  <Text style={styles.infoBullet}>
                    • Puedes activar o desactivar el modo 縦 cuando quieras.
                  </Text>

                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => setVerticalInfoVisible(false)}
                  >
                    <Text style={styles.infoButtonText}>Entendido</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ===== Pantalla principal =====
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#121212',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 90,
  },
  columnWrapper: {
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },

  // ===== Tarjeta de nota =====
  noteWrapper: {
    width: '48%',
    marginBottom: 14,
  },
  noteCard: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  noteColorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  noteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#ccc',
  },
  noteAvatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  noteDate: {
    fontSize: 10,
    color: '#888',
  },
  jpBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#222',
    marginLeft: 4,
  },
  jpBadgeText: {
    color: '#fff',
    fontSize: 11,
  },
  notePreview: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
    marginBottom: 8,
  },
  noteFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteFooterText: {
    fontSize: 11,
    color: '#999',
  },
  noteFooterIcon: {
    fontSize: 14,
    color: '#555',
  },

  // ===== Lista vacía =====
  emptyBox: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // ===== FAB =====
  fab: {
    position: 'absolute',
    right: '50%',
    marginRight: -32,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  fabIcon: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '700',
    marginTop: -2,
  },

  // ===== Editor =====
  editorContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  editorTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  editorTopTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  topBarButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    alignItems: 'center',
  },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: '#E4E4EA',
    padding: 2,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  modeButtonActive: {
    backgroundColor: '#000',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modeButtonTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: '#000',
  },
  titleInput: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 6,
    fontSize: 18,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderColor: '#DDD',
    color: '#222',
  },
  textAreaWrapper: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  textArea: {
    minHeight: 100,
    fontSize: 14,
    color: '#222',
    textAlignVertical: 'top',
  },

  // ===== Vista previa vertical =====
  verticalPreviewBox: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  verticalPreviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  verticalPreviewInner: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    paddingHorizontal: 24,
  },
  verticalPreviewText: {
    fontSize: 20,
    lineHeight: 24,
    color: '#FFF',
    // Hacemos una columna blanca sobre fondo oscuro, como tu ejemplo
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  // ===== Barra de dibujo =====
  drawToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  drawLabel: {
    fontSize: 13,
    color: '#555',
    marginRight: 10,
  },
  penColorRow: {
    flexDirection: 'row',
    flex: 1,
  },
  penColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  penColorDotSelected: {
    borderWidth: 2,
    borderColor: '#000',
  },
  clearDrawBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EEE',
  },
  clearDrawText: {
    fontSize: 11,
    color: '#444',
  },

  // ===== Canvas de dibujo =====
  drawingArea: {
    flex: 1,
    marginTop: 6,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  drawHintOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  drawHintText: {
    fontSize: 12,
    color: '#999',
  },

  // ===== Ventana info 縦 =====
  infoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  infoCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  infoBullet: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  infoButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#000',
  },
  infoButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
