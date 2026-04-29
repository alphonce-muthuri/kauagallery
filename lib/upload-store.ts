"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

interface UploadState {
  isOpen: boolean;
  defaultAlbum: string;
}

let state: UploadState = { isOpen: false, defaultAlbum: "" };
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

export const uploadStore = {
  open() {
    if (state.isOpen) return;
    state = { ...state, isOpen: true };
    emit();
  },
  openWithAlbum(album: string) {
    state = { isOpen: true, defaultAlbum: album };
    emit();
  },
  close() {
    if (!state.isOpen) return;
    state = { isOpen: false, defaultAlbum: "" };
    emit();
  },
  set(next: boolean) {
    if (next === state.isOpen) return;
    state = next
      ? { ...state, isOpen: true }
      : { isOpen: false, defaultAlbum: "" };
    emit();
  },
  toggle() {
    state = state.isOpen
      ? { isOpen: false, defaultAlbum: "" }
      : { ...state, isOpen: true };
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getOpen() {
    return state.isOpen;
  },
  getDefaultAlbum() {
    return state.defaultAlbum;
  },
  // Legacy compat
  get() {
    return state.isOpen;
  },
};

const getServerSnapshotBool = () => false;
const getServerSnapshotStr = () => "";

export function useUploadOpen(): [boolean, (next: boolean) => void] {
  const open = useSyncExternalStore(
    uploadStore.subscribe,
    uploadStore.getOpen,
    getServerSnapshotBool
  );
  return [open, uploadStore.set];
}

export function useUploadDefaultAlbum(): string {
  return useSyncExternalStore(
    uploadStore.subscribe,
    uploadStore.getDefaultAlbum,
    getServerSnapshotStr
  );
}
