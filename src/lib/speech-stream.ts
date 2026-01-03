export function connectSpeechEvents(
  onSpeak: (text: string) => void,
  onSilence: () => void
) {
  const api =
    localStorage.getItem("atom_api_url") || "http://localhost:8000";

  const source = new EventSource(`${api}/api/speech/stream`);

  source.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      console.log("speech event", data);

      if (data.type === "speak" && data.text) {
        onSpeak(data.text);
      }

      if (data.type === "silence") {
        onSilence();
      }
    } catch (err) {
      console.warn("Bad SSE event", err);
    }
  };

  source.onerror = () => {
    console.warn("Speech SSE disconnected");
    source.close();
  };

  return () => source.close();
}
