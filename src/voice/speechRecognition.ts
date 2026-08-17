export type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

export type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
};

export function appendSpeechTranscript(baseValue: string, event: SpeechRecognitionEventLike): string {
  const transcript = Array.from({ length: event.results.length }, (_, index) => event.results[index]?.[0]?.transcript ?? '').join('').trim();
  if (!transcript) return baseValue;
  const separator = baseValue && !/[\s\n]$/.test(baseValue) ? ' ' : '';
  return `${baseValue}${separator}${transcript}`;
}

export function hasSpeechRecognitionSupport(scope: Window = window): boolean {
  return Boolean(scope.SpeechRecognition || scope.webkitSpeechRecognition);
}
