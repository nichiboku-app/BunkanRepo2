from gtts import gTTS
from pathlib import Path

OUT_DIR = Path("assets/audio/katakana")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# romaji -> katakana
ROMAJI_TO_KATA = {
    "a": "ア", "i": "イ", "u": "ウ", "e": "エ", "o": "オ",
    "ka": "カ", "ki": "キ", "ku": "ク", "ke": "ケ", "ko": "コ",
    "sa": "サ", "shi": "シ", "su": "ス", "se": "セ", "so": "ソ",
    "ta": "タ", "chi": "チ", "tsu": "ツ", "te": "テ", "to": "ト",
    "na": "ナ", "ni": "ニ", "nu": "ヌ", "ne": "ネ", "no": "ノ",
    "ha": "ハ", "hi": "ヒ", "fu": "フ", "he": "ヘ", "ho": "ホ",
    "ma": "マ", "mi": "ミ", "mu": "ム", "me": "メ", "mo": "モ",
    "ya": "ヤ", "yu": "ユ", "yo": "ヨ",
    "ra": "ラ", "ri": "リ", "ru": "ル", "re": "レ", "ro": "ロ",
    "wa": "ワ", "wo": "ヲ",
    "n": "ン",
}

def synth_one(romaji: str, text_ja: str):
    out_path = OUT_DIR / f"{romaji}.mp3"
    if out_path.exists():
        print(f"[SKIP] {out_path} ya existe.")
        return
    print(f"[TTS] Generando {out_path.name} ...")
    tts = gTTS(text=text_ja, lang="ja")
    tts.save(str(out_path))

def main():
    for romaji, text in ROMAJI_TO_KATA.items():
        synth_one(romaji, text)
    print("\nListo. Archivos generados en:", OUT_DIR.resolve())

if __name__ == "__main__":
    main()
