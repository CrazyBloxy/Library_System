import { useState, useEffect } from 'react';
/* Icons */
import { TbDatabaseSearch } from "react-icons/tb";
/* Services (Backend API) & Types */
import api from "../../services/api";
import type { Data_Logs } from '../types';

export const Dashboard = () => {
    const [logs, setLogs] = useState<Data_Logs[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");


    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get<{ message: string; count: number; data: Data_Logs[] }>("/api/admin/logs");
                setLogs(response.data.data);
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
    const filteredLogs = logs.filter((log) => {
        const query = searchQuery.toLowerCase().trim();
        return (
            log.student_id?.toLowerCase().includes(query) ||
            log.name?.toLowerCase().includes(query) ||
            log.section?.toLowerCase().includes(query) ||
            log.book_id?.toLowerCase().includes(query) ||
            log.title?.toLowerCase().includes(query) || 
            log.status?.toLowerCase().includes(query) ||
            log.condition?.toLowerCase().includes(query)
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
                            <th>No.</th>
                            <th>STUDENT I.D.</th>
                            <th>NAME</th>
                            <th>SECTION</th>
                            <th>BOOK I.D.</th>
                            <th>TITLE</th>
                            <th>BORROW DATE</th>
                            <th>RETURN DATE</th>
                            <th>STATUS</th>
                            <th>CONDITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.id}</td>
                                    <td>{log.student_id}</td>
                                    <td>{log.name}</td>
                                    <td>{log.section}</td>
                                    <td>{log.book_id}</td>
                                    <td>{log.title}</td>
                                    <td>{log.borrow_date}</td>
                                    <td>{log.return_date}</td>
                                    <td>{log.status}</td>
                                    <td>{log.condition}</td>
                                </tr>
                            ))
                        ) : (<tr>
                            <td colSpan={12} className="text-center text-2xl py-12 text-base-400 font-semibold">
                                No Log match your search query "{searchQuery}"
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>

        </>
    );
};
