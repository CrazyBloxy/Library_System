import { useState, useEffect } from "react";
/* Services (Backend API) & Types */
import api from "../../../services/api"
import type { Data_Logs } from '../../types/index';

interface closeModal {
    onClose: () => void;
}



export const BorrowApproval = ({ onClose }: closeModal) => {
    const [logs, setLogs] = useState<Data_Logs[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get<{ message: string; count: number; data: Data_Logs[] }>("/api/admin/logs");
                const pendingOnly = response.data.data.filter(log => log.status === "Pending Borrow");
                setLogs(pendingOnly);
                setError(null);
            } catch (err: any) {
                console.error("API Error:", err)
                setError('Database link failed. Is your Express server running?');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const handleAcceptBorrow = async (logId: number) => {
        setActionLoadingId(logId); // Pinpoint exactly which log is updating
        setError(null);
        setSuccessMessage(null);

        try {
            // Pass the dynamic ID straight into your template literal route string
            const response = await api.patch(`/api/admin/accept-borrow/${logId}`);

            if (response.status === 200) {
                setSuccessMessage(response.data.message);

                // REMOVE from UI: Instantly filters out the approved item from local state array
                setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
            }
        } catch (err: any) {
            console.error("Patch Error:", err);
            const errMsg = err.response?.data?.message || "Failed to finalize approval action.";
            setError(errMsg);
        } finally {
            setActionLoadingId(null);
        }
    };

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

    return (
        <>
            <div className="overflow-y-auto max-h-125 h-125">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full p-1 grow border-4">
                    {logs.map((log) => (
                        <div key={log.id} className="card card-border bg-base-100 w-full h-fit card-sm shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title">{log.name} : {log.student_id}</h2>

                                <div className="text-xs space-y-1 text-base-400 mt-1">
                                    <p><span className="font-semibold text-base-content">Book ID:</span> {log.book_id}</p>
                                    <p><span className="font-semibold text-base-content">Book Title:</span> <span className="italic text-blue-200">{log.title}</span></p>
                                </div>

                                <div className="card-actions justify-end">
                                    <button
                                        className="btn btn-xs btn-error btn-soft"
                                        disabled={actionLoadingId !== null}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAcceptBorrow(log.id)}
                                        className="btn btn-xs btn-accent btn-soft min-w-17.5"
                                        disabled={actionLoadingId !== null}
                                    >
                                        {actionLoadingId === log.id ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            "Approve"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <div className="flex self-center">
                <button onClick={() => onClose()} className="btn btn-soft btn-error"> Back </button>
            </div>

        </>
    );
};