import {create} from 'zustand';

interface ToneState {
    tone:string;
    setTone: (tone:string) => void;
}

export const useTone = create<ToneState>((set) => ({
    tone: '',
    setTone: (tone:string) => set({tone}),
}));