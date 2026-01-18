// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { supabase } from '../../services/apiClient';
// import { ClassSection } from '../../types';

// interface ClassesState {
//     classes: ClassSection[];
//     loading: boolean;
//     error: string | null;
// }

// const initialState: ClassesState = {
//     classes: [],
//     loading: false,
//     error: null,
// };

// export const fetchClasses = createAsyncThunk('classes/fetchClasses', async (_, thunkAPI) => {
//     try {
//         const { data, error } = await supabase.from('class_sections').select('*');
//         console.log(data)
//         if (error) throw error;
//         return data as ClassSection[];
//     } catch (error: any) {
//         return thunkAPI.rejectWithValue(error.message);
//     }
// });


// export const createClass = createAsyncThunk('classes/createClass', async (newClass: Partial<ClassSection>, thunkAPI) => {
//     try {
//         const { data, error } = await supabase.from('class_sections').insert(newClass).select().single();
//         if (error) throw error;
//         return data;
//     } catch (error: any) {
//         return thunkAPI.rejectWithValue(error.message);
//     }
// });

// const classesSlice = createSlice({
//     name: 'classes',
//     initialState,
//     reducers: {},
//     extraReducers: builder => {
//       builder
//         .addCase(fetchClasses.pending, (state) => {
//           state.loading = true;
//           state.error = null;
//         })
//         .addCase(fetchClasses.fulfilled, (state, action) => {
//           state.classes = action.payload;
//           state.loading = false;
//         })
//         .addCase(fetchClasses.rejected, (state, action) => {
//           state.loading = false;
//           state.error = action.payload as string;
//         })
//         .addCase(createClass.pending, (state) => {
//           state.loading = true;
//         })
//         .addCase(createClass.fulfilled, (state, action) => {
//           state.loading = false;
//           state.classes = [...state.classes, action.payload];
//         })
//         .addCase(createClass.rejected, (state, action) => {
//           state.loading = false;
//           state.error = action.payload as string;
//         });
//     },
//   });

// export default classesSlice.reducer;
