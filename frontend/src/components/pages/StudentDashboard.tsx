import { useState, useEffect } from 'react';
/* Icons */
import { TbDatabaseSearch } from "react-icons/tb";
/* Services (Backend API) & Types */
import api from "../../services/api";
import type { Student } from '../types';

export const StudentDashboard = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const fetchBooks = async () => {
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
        fetchBooks();
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
                        {filteredStudents.length > 0 ? (
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
                                    <th><button className='btn btn-circle btn-warning w-20'>EDIT</button></th>
                                    <th><button className='btn btn-circle btn-error w-20'>DELETE</button></th>

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
        </>
    );
};