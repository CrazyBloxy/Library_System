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
        setActionLoadingId(logId);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await api.patch(`/api/admin/accept-borrow/${logId}`);

            if (response.status === 200 || response.status === 201) {
                setSuccessMessage(response.data.message);

                // Filters out the approved item from local state array
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

    const handleRejectBorrow = async (logId: number) => {
        setActionLoadingId(logId);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await api.delete(`/api/admin/logs/decline/${logId}`);

            if (response.status === 200) {
                setSuccessMessage(response.data.message);

                // Filters out the approved item from local state array
                setLogs((prevLogs) => prevLogs.filter((log) => log.id !== logId));
            }
        } catch (err: any) {
            console.error("Delete Network Request Error:", err);
            const errMsg = err.response?.data?.message || "Failed to drop the transaction log.";
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

    return (
        <>
            {successMessage && (
                <div className="alert alert-success w-full max-w text-sm py-2 justify-center text-center animate-fade-in">
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error w-full max-w text-sm py-3 justify-center text-center">
                    <span>{error}</span>
                </div>
            )}

            {logs.length === 0 ? (
                <div className="text-center py-24 text-base-400 font-semibold text-xl tracking-wide animate-fade-in w-full">
                    No Request has been made yet
                </div>
            ) : (
                <div className="overflow-y-auto max-h-105 h-105">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full p-1 grow">
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
                                            onClick={() => handleRejectBorrow(log.id)}
                                            className="btn btn-xs btn-error btn-soft"
                                            disabled={actionLoadingId !== null}
                                        >
                                            {actionLoadingId === log.id ? (
                                                <span className="loading loading-spinner loading-xs"></span>
                                            ) : (
                                                "Reject"
                                            )}
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
            )}

            <div className="flex self-center">
                <button onClick={() => onClose()} className="btn btn-soft btn-error"> Back </button>
            </div>

        </>
    );
};