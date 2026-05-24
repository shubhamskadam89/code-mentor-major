export interface ExtractedProblem {
  platform: string;
  title: string;
  description: string;
  difficulty?: string;
  constraints?: string;
  url: string;
}

export interface SignalVector {
  hasRecursion: boolean;
  hasDPArray: boolean;
  hasMemo: boolean;
  usesSort: boolean;
  usesHashMap: boolean;
  loopDepth: number;
}

export interface CodeUpdateRequest {
  sessionId: string;
  problemContextId?: string; // assigned by backend
  language: string;
  rawCode: string;
  signalVector: SignalVector;
}
