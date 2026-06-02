import { useState } from "react";

import { StudentForm } from "../forms/StudentForm";

export const Home = () => {
    const [showModal, setModal] = useState(false);

    return (
        <>
        <button onClick={() => setModal(true)} className="btn btn-soft">
            Le test
        </button>
        {showModal && (
            
            <div className="fixed bg-black/50 min-h-screen z-10 w-screen flex justify-center items-center top-0 left-0">
                <div className="bg-info-content p-20 w-150">
                    <div className="flex flex-col gap-4">
                        <StudentForm onClose={() => setModal(false)}/>
                    </div>
                </div>
            </div>
        )}
        </>
        
    );
};
