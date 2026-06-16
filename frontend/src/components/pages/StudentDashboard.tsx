import { useState, useEffect } from 'react';
/* Icons */
import { TbDatabaseSearch } from "react-icons/tb";
/* Services (Backend API) & Types */
import api from "../../services/api";
import type { Student } from '../types/index';
import { EditStudent } from './forms/EditStudent';

export const StudentDashboard = () => {
    const [modalState, setModalState] = useState<{ type: string; id: string } | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get<{ message: string; count: number; data: Student[] }>("/api/admin/studentdb");
                setStudents(response.data.data);
                setError(null);
            } catch (err: any) {
                console.error("API Error:", err)
                setError('Database link failed. Is your Express server running?');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error max-w-6xl mx-auto mt-12">
                <span>{error}</span>
            </div>
        );
    }

    const handleUpdateStudentState = (originalTargetId: string, updatedStudent: Student) => {
        setStudents((prevStudents) =>
            prevStudents.map((student) =>
                student.student_id === originalTargetId ? updatedStudent : student
            )
        );
    };

    const formsComponents: Record<string, React.ReactNode> = {
        edit: (
            <EditStudent
                studentIdToEdit={modalState?.id || ""}
                onClose={() => setModalState(null)}
                onStudentUpdated={(updatedData) => handleUpdateStudentState(modalState?.id || "", updatedData)}
            />
        )
    };

    const handleDeleteStudent = async (studentId: string, studentName: string) => {
        // Prevent accidental mouse click triggers
        const confirmDelete = window.confirm(`Are you absolutely sure you want to permanently delete ${studentName} (${studentId})?`);
        if (!confirmDelete) return;

        setDeleteLoadingId(studentId); // Highlight only this specific row as loading
        try {
            const response = await api.delete(`/api/admin/removestudent/${studentId}`);

            if (response.status === 200) {
                // 2. VISUAL SWEEP: Instantly drop the row from the viewport list array
                setStudents((prevStudents) => prevStudents.filter((student) => student.student_id !== studentId));
                alert(response.data.message);
            }
        } catch (err: any) {
            console.error("Delete tracking execution failed:", err);
            const errMsg = err.response?.data?.message || "Could not complete record removal.";
            alert(errMsg);
        } finally {
            setDeleteLoadingId(null);
        }
    };

    // Search Filter
    const filteredStudents = students.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
            student.student_id?.toLowerCase().includes(query) ||
            student.name?.toLowerCase().includes(query) ||
            student.section?.toLowerCase().includes(query)
        );
    });

    return (
        <>
            {/* Search Bar */}
            <label className="input flex mx-auto mt-5">
                <TbDatabaseSearch />
                <input
                    type="search"
                    required
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </label>

            {/* Database Table */}
            <div className="overflow-y-auto max-h-96 h-96 mt-3 mx-auto w-full max-w-6xl flex flex-col border-4 rounded-lg">
                <table className="table table-xs">
                    <thead>
                        <tr>
                            <th>STUDENT I.D.</th>
                            <th>NAME</th>
                            <th>SECTION</th>
                            <th>ACTIVE</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="text-center text-2xl py-12 text-base-400 font-semibold">
                                    No Student Data found in the system.
                                </td>
                            </tr>
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.student_id}>
                                    <td>{student.student_id}</td>
                                    <td>{student.name}</td>
                                    <td>{student.section}</td>
                                    <td>
                                        <span className={`badge ${student.active ? 'badge-success' : 'badge-error'}`}>
                                            {student.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <th><button
                                        onClick={() => setModalState({ type: "edit", id: student.student_id })}
                                        className='btn btn-circle btn-warning w-20'
                                    >EDIT
                                    </button></th>
                                    <th><button
                                        onClick={() => handleDeleteStudent(student.student_id, student.name)}
                                        className='btn btn-circle btn-error w-20'
                                        disabled={deleteLoadingId !== null}
                                    >
                                        {deleteLoadingId === student.student_id ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            "DELETE"
                                        )}
                                    </button></th>
                                </tr>
                            ))
                        ) : (<tr>
                            <td colSpan={12} className="text-center text-2xl py-12 text-base-400 font-semibold">
                                No Student match your search query "{searchQuery}"
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>

            {/* Checks if activeForms has a string */}
            {modalState && (
                <div className="fixed bg-black/50 min-h-screen z-10 w-screen flex justify-center items-center top-0 left-0">
                    <div className="bg-info-content p-8 w-150 h-150">
                        <div className="flex flex-col gap-4">
                            {formsComponents[modalState.type]}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};