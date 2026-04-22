import { INote, ITag } from "@/interfaces";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getNote } from "@utils/apiUtil";

interface NoteState {
  data: ITag;
  loading: boolean;
  error: string | null;
}

interface NoteInputPayload {
  name: keyof NoteState["data"];
  value: string | boolean | number;
}

export const fetchNote = createAsyncThunk<ITag, number>(
  "note/fetchNote",
  async (id: number) => {
    const note = await getNote(id);
    return note;
  }
);

const initialState: NoteState = {
  data: {
    id: null,
    userId: null,
    title: "",
    body: "",
    desk: false,
    x: 0,
    y: 0,
    deskId: null,
    createdAt: null,
    isActive: false,
  },
  loading: true,
  error: null,
};

const noteSlicer = createSlice({
  name: "note",
  initialState,
  reducers: {
    noteInputChange(state, action: PayloadAction<NoteInputPayload>) {
      state.data = {
        ...state.data,
        [action.payload.name]: action.payload.value,
      };
    },
    setFullNote(state, action: PayloadAction<NoteState["data"]>) {
      state.data = { ...action.payload };
      state.loading = false;
      state.error = null;
    },
    deleteNoteError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetNote(state) {
      return initialState;
    },
    setNoteLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNote.fulfilled, (state, action) => {
        state.data = { ...action.payload, isActive: true };
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch note";
      });
  },
});

export const {
  resetNote,
  deleteNoteError,
  noteInputChange,
  setFullNote,
  setNoteLoading,
} = noteSlicer.actions;

export default noteSlicer.reducer;
