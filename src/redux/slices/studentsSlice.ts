// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { supabase } from '../../services/apiClient';
// import { Student } from '../../types';

// interface StudentsState {
//     students: Student[];
//     loading: boolean;
//     error: string | null;
// }

// const initialState: StudentsState = {
//     students: [],
//     loading: false,
//     error: null,
// };

// export const fetchStudents = createAsyncThunk('students/fetchStudents', async (_, thunkAPI) => {
//     try {
//         const { data, error } = await supabase.from('students').select('*');
//         if (error) throw error;
//         return data as Student[];
//     } catch (error: any) {
//         return thunkAPI.rejectWithValue(error.message);
//     }
// });

// export const createStudent = createAsyncThunk('students/createStudent', async (student: Partial<Student>, thunkAPI) => {
//     try {
//         const { data, error } = await supabase.from('students').insert(student).select().single();
//         if (error) throw error;
//         return data;
//     } catch (error: any) {
//         return thunkAPI.rejectWithValue(error.message);
//     }
// });

// export const deleteStudent = createAsyncThunk('students/deleteStudent', async (studentId: string, thunkAPI) => {
//     try {
//       const { error } = await supabase.from('students').delete().eq('id', studentId);
//       if (error) throw error;
//       return studentId;
//     } catch (error: any) {
//       return thunkAPI.rejectWithValue(error.message);
//     }
// });

// const studentsSlice = createSlice({
//     name: 'students',
//     initialState,
//     reducers: {},
//     extraReducers: builder => {
//         builder
//             .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
//             .addCase(fetchStudents.fulfilled, (state, action) => { state.students = action.payload; state.loading = false; })
//             .addCase(fetchStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
//             .addCase(createStudent.pending, (state) => { state.loading = true; })
//             .addCase(createStudent.fulfilled, (state, action) => { state.loading = false; state.students.push(action.payload); })
//             .addCase(createStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
//             .addCase(deleteStudent.pending, (state) => { state.loading = true; })
//             .addCase(deleteStudent.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.students = state.students.filter(s => s.id !== action.payload);
//             })
//             .addCase(deleteStudent.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
//     },
// });

// export default studentsSlice.reducer;
