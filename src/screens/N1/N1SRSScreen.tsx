// src/screens/N1/N1SRSScreen.tsx
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { N1_KANJI_META } from "../../data/n1_kanji_meta";
import { dueCards, ensureCard, loadAll, review, saveAll, SRSCard } from "../../kanji/srs";

type Params = { id: string; hex: string };

export default function N1SRSScreen({ route, navigation }: any) {
  const { id, hex } = route.params as Params;
  const [map, setMap] = useState<Record<string, SRSCard>>({});
  const [queue, setQueue] = useState<SRSCard[]>([]);
  const meta = useMemo(()=>N1_KANJI_META.find(m=>m.hex.toLowerCase()===hex.toLowerCase()),[hex]);

  useEffect(()=>{ (async ()=>{
    const m = await loadAll();
    ensureCard(m, id, hex);
    setMap(m);
    setQueue(dueCards(m, 30));
  })(); }, [id, hex]);

  const current = queue[0];

  const answer = async (quality: 0|1|2|3|4|5) => {
    const card = review(map[current.id], quality);
    const next = { ...map, [card.id]: card };
    setMap(next);
    await saveAll(next);
    setQueue(q => q.slice(1));
  };

  if (!meta) return <View style={S.wrap}><Text style={{color:"#fff"}}>No meta</Text></View>;

  return (
    <View style={S.wrap}>
      <StatusBar barStyle="light-content" />
      {!current ? (
        <View style={{alignItems:"center", justifyContent:"center", flex:1, gap:10}}>
          <Text style={S.done}>¡Nada pendiente!</Text>
          <Pressable style={S.cta} onPress={()=>navigation.goBack()}><Text style={S.ctaTxt}>Cerrar</Text></Pressable>
        </View>
      ) : (
        <View style={{padding:16, gap:14}}>
          <Text style={S.badge}>Pendientes: {queue.length}</Text>
          <Text style={S.big}>{meta.k}</Text>
          <Text style={S.mean}>{meta.es}</Text>
          <Pressable style={S.speak} onPress={()=>{ try{Speech.stop(); Speech.speak(meta.k, {language:"ja-JP"});}catch{}}}>
            <Text style={S.speakTxt}>🔊 Pronunciar</Text>
          </Pressable>

          <Text style={S.lab}>¿Cómo te fue?</Text>
          <View style={S.row}>
            {[0,1,2,3,4,5].map((q)=>(
              <Pressable key={q} style={[S.btn, q>=3?S.ok:S.bad]} onPress={()=>answer(q as any)}>
                <Text style={S.btnTxt}>{q}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={S.help}>0–2 Fallo · 3 Regular · 4 Bien · 5 Perfecto</Text>
        </View>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  wrap:{flex:1, backgroundColor:"#0B0F19"},
  big:{color:"#fff", fontSize:64, fontWeight:"900"},
  mean:{color:"#CFE4FF", fontWeight:"800"},
  badge:{alignSelf:"flex-start", color:"#063A3A", backgroundColor:"#36D9C6", paddingHorizontal:10, paddingVertical:4, borderRadius:999, fontWeight:"900"},
  lab:{color:"#CFE4FF", fontWeight:"900", marginTop:8},
  row:{flexDirection:"row", gap:8},
  btn:{flex:1, paddingVertical:12, borderRadius:12, alignItems:"center"},
  ok:{backgroundColor:"rgba(51,218,198,0.2)", borderWidth:1, borderColor:"rgba(51,218,198,0.8)"},
  bad:{backgroundColor:"rgba(255,255,255,0.06)", borderWidth:1, borderColor:"rgba(255,255,255,0.2)"},
  btnTxt:{color:"#EAF1FF", fontWeight:"900"},
  help:{color:"rgba(255,255,255,0.6)"},
  done:{color:"#CFE4FF", fontSize:18, fontWeight:"900"},
  cta:{backgroundColor:"#33DAC6", paddingVertical:12, paddingHorizontal:18, borderRadius:12},
  ctaTxt:{color:"#053A38", fontWeight:"900"},
  speak:{alignSelf:"flex-start", backgroundColor:"#2B7FFF", paddingHorizontal:10, paddingVertical:8, borderRadius:10},
  speakTxt:{color:"#EAF1FF", fontWeight:"900"},
});
